import db from '../database/models/index.js'
import { AppError } from '../utils/index.js'
import { Op } from 'sequelize'
import { isBefore, isToday, isAfter, differenceInMinutes } from 'date-fns'
import { paginate } from '../utils/pagination.js'

const { Task } = db.sequelize.models

export class TasksService {
    async findAll(options) {
        console.log(options)
        const { page, limit, ...restOptions } = options
        const offset = (page - 1) * limit

        const tasks = await Task.findAll({
            where: {
                ...restOptions,
                ...(options.userId && { userId: options.userId }),
            },
            offset: offset,
            limit: limit,
        })

        const totalItems = await Task.count({
            where: {
                ...restOptions,
                ...(options.userId && { userId: options.userId }),
            },
        })
        const paginatedData = paginate(totalItems, limit, page)
        paginatedData.data = tasks
        return paginatedData
    }

    async findOne(options = {}) {
        return await Task.findOne(options)
    }

    async findById(id, options = {}) {
        const task = await Task.findByPk(id, options)
        return task
    }

    async create(data) {
        const today = new Date()
        if (isBefore(data.startDate, today)) {
            throw AppError.badRequest('Start date cannot be in the past')
        }
        if (isBefore(data.dueDate, today)) {
            throw AppError.badRequest('Due date cannot be in the past')
        }
        if (isBefore(data.dueDate, new Date(data.startDate))) {
            throw AppError.badRequest('Due date cannot be before start date')
        }

        let status
        if (isToday(data.startDate)) {
            status = 'in-progress'
        }
        if (isAfter(data.startDate, today)) {
            status = 'pending'
        }
        await Task.create({ ...data, status: status })
    }

    async update(id, data) {
        const task = await this.findById(id)
        if (!task) {
            throw AppError.notFound('Task not found')
        }
        let modData = { ...data }

        const today = new Date()
        if (data.startDate) {
            if (isBefore(data.startDate, today)) {
                throw AppError.badRequest('Start date cannot be in the past')
            }
            modData.startDate = data.startDate
        }
        if (data.dueDate) {
            if (isBefore(data.dueDate, today)) {
                throw AppError.badRequest('End date cannot be in the past')
            }
            if (isBefore(data.dueDate, new Date(data.startDate))) {
                throw AppError.badRequest(
                    'Due date cannot be before start date'
                )
            }
            modData.dueDate = data.dueDate
        }

        if (data.startDate && data.dueDate) {
            if (isBefore(data.dueDate, new Date(data.startDate))) {
                throw AppError.badRequest(
                    'Due date cannot be before start date'
                )
            }
        }
        let status
        if (data.status) {
            if (isToday(data.startDate)) {
                status = 'in-progress'
            }
            if (isAfter(data.startDate, today)) {
                status = 'pending'
            }

            if (status) data.status = status
        }

        await task.update(modData)
    }

    async completeTask(userId, taskId) {
        const task = await this.findById(taskId, {
            userId: userId,
            status: 'in-progress',
        })
        if (!task) {
            throw AppError.notFound('Task not found')
        }
        if (task.status === 'completed') {
            throw AppError.badRequest('Task is already completed')
        }
        if (task.status === 'pending') {
            task.status = 'in-progress'
        }
        task.status = 'completed'
        task.endDate = new Date()
        await task.save()
    }

    async delete(id) {
        const task = await this.findById(id)
        if (!task) {
            throw AppError.notFound('Task not found')
        }
        await task.destroy()
    }

    // Return tasks that are in progress or completed along with their time spent.
    // It calculates the time spent on each task based on the start date and either the due date (if completed) or the end date (if in progress).
    // If a user type is user, it filters tasks by userId or returns all tasks is user type is admin.
    async generateTimeReport(options) {
        // Get all tasks matching the criteria
        const offset = (options.page - 1) * options.limit
        const tasks = await Task.findAll({
            where: {
                status: {
                    [Op.or]: ['completed', 'in-progress'],
                },
                ...(options.userId && { userId: options.userId }),
            },
            offset: offset,
            limit: options.limit,
        })

        const totalItems = await Task.count({
            where: {
                [Op.or]: [{ status: 'completed' }, { status: 'in-progress' }],
            },
        })

        const data = tasks.map((task) => {
            const timeDifference = differenceInMinutes(
                new Date(task.startDate),
                task.status === 'completed'
                    ? new Date(task.dueDate)
                    : new Date(task.endDate)
            )
            return {
                ...task.dataValues,
                timeSpent: timeDifference,
            }
        })
        const paginatedData = paginate(
            totalItems.length,
            options.limit,
            options.page
        )
        paginatedData.data = data
        return paginatedData
    }

    async generateCompletionReport(options) {
        // Get all tasks matching the criteria

        const totalTasks = await Task.count({
            where: {
                ...options,
            },
        })
        const completedTasks = await Task.count({
            where: {
                ...options,
                status: 'completed',
            },
        })

        const inProgressTasks = await Task.count({
            where: {
                ...options,
                status: 'in-progress',
            },
        })

        const pendingTasks = await Task.count({
            where: {
                ...options,
                status: 'pending',
            },
        })

        // Calculate completion rate
        const completionRate =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        const report = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionRate: parseFloat(completionRate.toFixed(2)),
        }

        return report
    }
}

export default TasksService
