import db from "../database/models/index.js"
import {AppError, Cache} from "../utils/index.js";
import {startOfDay, compareAsc, differenceInMinutes} from 'date-fns';

const {Task} = db.sequelize.models;

export class TasksService {
    /**
     * Helper method to invalidate task-related caches
     * @param {string|number} taskId - Optional task ID to invalidate specific task cache
     * @private
     */
    _invalidateCache(taskId = null) {
        // If a specific task ID is provided, invalidate its cache
        if (taskId) {
            // Use a wildcard pattern to match all cache keys for this task
            const cacheKeyPattern = `tasks:findById:${taskId}:`;

            // Get all cache keys
            const allKeys = Array.from(Cache.cache.keys());

            // Find and delete keys that match the pattern
            allKeys.forEach(key => {
                if (key.startsWith(cacheKeyPattern)) {
                    Cache.delete(key);
                }
            });
        }

        // Invalidate all findAll caches
        const allKeys = Array.from(Cache.cache.keys());
        allKeys.forEach(key => {
            if (key.startsWith('tasks:findAll:')) {
                Cache.delete(key);
            }
        });

        // Invalidate report caches
        allKeys.forEach(key => {
            if (key.startsWith('tasks:report:')) {
                Cache.delete(key);
            }
        });
    }
    async findAll(options = {}) {
        // Create a cache key based on the options
        const cacheKey = `tasks:findAll:${JSON.stringify(options)}`;

        // Check if the result is in the cache
        const cachedResult = Cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // If not in cache, fetch from database
        const tasks = await Task.findAll(options);

        // Cache the result for 5 minutes (300000 ms)
        Cache.set(cacheKey, tasks, 300000);

        return tasks;
    }

    async findOne(options = {}) {
        return await Task.findOne(options);
    }

    async findById(id, options = {}) {
        // Create a cache key based on the id and options
        const cacheKey = `tasks:findById:${id}:${JSON.stringify(options)}`;

        // Check if the result is in the cache
        const cachedResult = Cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // If not in cache, fetch from database
        const task = await Task.findByPk(id, options);

        // Cache the result for 5 minutes (300000 ms)
        if (task) {
            Cache.set(cacheKey, task, 300000);
        }

        return task;
    }

    async create(data) {
        // Determine status based on dueDate
        const today = startOfDay(new Date());

        if (!data.dueDate) {
            // If no dueDate is provided, set status to in-progress
            data.status = 'in-progress';
            // Set startTime to now for in-progress tasks
            data.startTime = new Date();
        } else {
            const dueDate = startOfDay(new Date(data.dueDate));

            // compareAsc returns:
            // -1 if dueDate is before today
            // 0 if dueDate is the same as today
            // 1 if dueDate is after today
            const comparison = compareAsc(dueDate, today);

            if (comparison <= 0) {
                // If dueDate is today or in the past, set status to in-progress
                data.status = 'in-progress';
                // Set startTime to now for in-progress tasks
                data.startTime = new Date();
            } else {
                // If dueDate is in the future, set status to pending
                data.status = 'pending';
            }
        }

        const task = await Task.create(data);

        // Invalidate cache after creating a new task
        this._invalidateCache();

        return task;
    }

    async update(id, data) {
        const task = await this.findById(id);
        if (!task) {
            throw AppError.notFound('Task not found')
        }

        // Handle status changes for time tracking
        if (data.status) {
            // If status is changing to in-progress and startTime is not set
            if (data.status === 'in-progress' && task.status !== 'in-progress' && !task.startTime) {
                data.startTime = new Date();
            }

            // If status is changing to completed
            if (data.status === 'completed' && task.status !== 'completed') {
                // Set endTime if not already set
                if (!data.endTime) {
                    data.endTime = new Date();
                }

                // Calculate timeSpent if task was in-progress
                if (task.startTime) {
                    const startTime = new Date(task.startTime);
                    const endTime = new Date(data.endTime);

                    // Use differenceInMinutes from date-fns to calculate time spent
                    const timeSpentMinutes = differenceInMinutes(endTime, startTime);

                    // Add to existing timeSpent if any
                    data.timeSpent = (task.timeSpent || 0) + timeSpentMinutes;
                }
            }
        }

        await task.update(data);

        // Invalidate cache after updating the task
        this._invalidateCache(id);

        return task;
    }

    async delete(id) {
        const task = await this.findById(id);
        if (!task) {
            throw AppError.notFound('Task not found')
        }
        await task.destroy();

        // Invalidate cache after deleting the task
        this._invalidateCache(id);
    }

    /**
     * Helper method to build query options with date range
     * @param {Object} options - Query options
     * @returns {Object} Query options with date range
     * @private
     */
    _buildQueryWithDateRange(options = {}) {
        const {where = {}, startDate, endDate} = options;

        // Build query conditions
        const queryOptions = {where: {...where}};

        // Add date range conditions if provided
        if (startDate || endDate) {
            queryOptions.where.createdAt = {};

            if (startDate) {
                // Use startOfDay to ensure we include the entire start date
                queryOptions.where.createdAt[db.sequelize.Op.gte] = startOfDay(new Date(startDate));
            }

            if (endDate) {
                // For end date, we still want to include the entire day
                const endDateObj = new Date(endDate);
                // Set to end of day by adding one day and then using startOfDay
                endDateObj.setDate(endDateObj.getDate() + 1);
                queryOptions.where.createdAt[db.sequelize.Op.lt] = startOfDay(endDateObj);
            }
        }

        return queryOptions;
    }

    /**
     * Generate a report on time spent on tasks
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Date} options.startDate - Start date for the report period
     * @param {Date} options.endDate - End date for the report period
     * @returns {Object} Time tracking report data
     */
    async generateTimeReport(options = {}) {
        // Create a cache key based on the options
        const cacheKey = `tasks:report:time:${JSON.stringify(options)}`;

        // Check if the result is in the cache
        const cachedResult = Cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const queryOptions = this._buildQueryWithDateRange(options);

        // Get all tasks matching the criteria
        const tasks = await this.findAll(queryOptions);

        // Calculate average time spent on completed tasks
        const completedTasksWithTime = tasks.filter(task =>
            task.status === 'completed' && task.timeSpent !== null && task.timeSpent > 0
        );

        const totalTimeSpent = completedTasksWithTime.reduce((sum, task) => sum + task.timeSpent, 0);
        const averageTimeSpent = completedTasksWithTime.length > 0
            ? totalTimeSpent / completedTasksWithTime.length
            : 0;

        // Get tasks with the most and least time spent
        let mostTimeConsumingTask = null;
        let leastTimeConsumingTask = null;

        if (completedTasksWithTime.length > 0) {
            mostTimeConsumingTask = completedTasksWithTime.reduce((prev, current) => 
                (prev.timeSpent > current.timeSpent) ? prev : current
            );

            leastTimeConsumingTask = completedTasksWithTime.reduce((prev, current) => 
                (prev.timeSpent < current.timeSpent) ? prev : current
            );
        }

        const report = {
            totalTasks: tasks.length,
            completedTasksWithTime: completedTasksWithTime.length,
            totalTimeSpent,
            averageTimeSpent: parseFloat(averageTimeSpent.toFixed(2)),
            mostTimeConsumingTask: mostTimeConsumingTask ? {
                id: mostTimeConsumingTask.id,
                title: mostTimeConsumingTask.title,
                timeSpent: mostTimeConsumingTask.timeSpent
            } : null,
            leastTimeConsumingTask: leastTimeConsumingTask ? {
                id: leastTimeConsumingTask.id,
                title: leastTimeConsumingTask.title,
                timeSpent: leastTimeConsumingTask.timeSpent
            } : null,
            timeUnit: 'minutes'
        };

        // Cache the result for 10 minutes (600000 ms)
        Cache.set(cacheKey, report, 600000);

        return report;
    }

    /**
     * Generate a report on task completion rates
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Date} options.startDate - Start date for the report period
     * @param {Date} options.endDate - End date for the report period
     * @returns {Object} Completion rate report data
     */
    async generateCompletionReport(options = {}) {
        // Create a cache key based on the options
        const cacheKey = `tasks:report:completion:${JSON.stringify(options)}`;

        // Check if the result is in the cache
        const cachedResult = Cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const queryOptions = this._buildQueryWithDateRange(options);

        // Get all tasks matching the criteria
        const tasks = await this.findAll(queryOptions);

        // Calculate statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;

        // Calculate completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const report = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionRate: parseFloat(completionRate.toFixed(2))
        };

        // Cache the result for 10 minutes (600000 ms)
        Cache.set(cacheKey, report, 600000);

        return report;
    }

    /**
     * Generate a report on task completion rate and time spent (legacy method)
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Date} options.startDate - Start date for the report period
     * @param {Date} options.endDate - End date for the report period
     * @returns {Object} Report data
     * @deprecated Use generateTimeReport or generateCompletionReport instead
     */
    async generateReport(options = {}) {
        // Create a cache key based on the options
        const cacheKey = `tasks:report:legacy:${JSON.stringify(options)}`;

        // Check if the result is in the cache
        const cachedResult = Cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const queryOptions = this._buildQueryWithDateRange(options);

        // Get all tasks matching the criteria
        const tasks = await this.findAll(queryOptions);

        // Calculate statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;

        // Calculate completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate average time spent on completed tasks
        const completedTasksWithTime = tasks.filter(task =>
            task.status === 'completed' && task.timeSpent !== null && task.timeSpent > 0
        );

        const totalTimeSpent = completedTasksWithTime.reduce((sum, task) => sum + task.timeSpent, 0);
        const averageTimeSpent = completedTasksWithTime.length > 0
            ? totalTimeSpent / completedTasksWithTime.length
            : 0;

        const report = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionRate: parseFloat(completionRate.toFixed(2)),
            averageTimeSpent: parseFloat(averageTimeSpent.toFixed(2)),
            timeUnit: 'minutes'
        };

        // Cache the result for 10 minutes (600000 ms)
        Cache.set(cacheKey, report, 600000);

        return report;
    }
}

export default TasksService;
