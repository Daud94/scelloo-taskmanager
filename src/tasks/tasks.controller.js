import express from 'express'
import { TasksService } from './tasks.service.js'
import { Body, Query } from '../validators/index.js'
import {
    CreateTaskDto,
    UpdateTaskDto,
    ReportQueryDto,
    TaskQueryDto,
} from './dtos/index.js'
import { AuthMiddleware } from '../middleware/index.js'
import { AppError } from '../utils/index.js'
import { Op } from 'sequelize'

const router = express.Router()
const tasksService = new TasksService()

// Create a new task
router.post(
    '/',
    AuthMiddleware,
    Body(CreateTaskDto),
    async (req, res, next) => {
        try {
            const task = await tasksService.create({
                ...req.body,
                userId: req.userId,
            })

            return res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task,
            })
        } catch (error) {
            next(error)
        }
    }
)

// Get all tasks for the authenticated user
router.get('/', AuthMiddleware, Query(TaskQueryDto), async (req, res, next) => {
    try {
        const { title, description, status, startDate, endDate, page, limit } =
            req.query
        const where = {}
        if (title) {
            where.title = {
                [Op.like]: `%${title}%`,
            }
        }
        if (description) {
            where.description = {
                [Op.like]: `%${description}%`,
            }
        }
        if (status) {
            where.status = status
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            }
        }
        where.userId = req.userId // Ensure only tasks for the authenticated user are retrieved
        where.page = page
        where.limit = limit
        const tasks = await tasksService.findAll(where)

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: tasks,
        })
    } catch (error) {
        next(error)
    }
})

// Generate a report on time spent on tasks
router.get(
    '/report-time',
    AuthMiddleware,
    Query(ReportQueryDto),
    async (req, res, next) => {
        try {
            const { page, limit } = req.query

            // Admin can generate report for all tasks, regular users only for their own
            const options =
                req.userType === 'admin' ? {} : { userId: req.userId }
            options.page = page
            options.limit = limit

            console.log(options)
            // Generate time report
            const report = await tasksService.generateTimeReport(options)

            return res.status(200).json({
                success: true,
                message: 'Time tracking report generated successfully',
                data: report,
            })
        } catch (error) {
            next(error)
        }
    }
)

// Generate a report on task completion rates
router.get('/reports', AuthMiddleware, async (req, res, next) => {
    try {
        // Admin can generate report for all tasks, regular users only for their own
        const options = req.userType === 'admin' ? {} : { userId: req.userId }

        // Generate completion report
        const report = await tasksService.generateCompletionReport(options)

        return res.status(200).json({
            success: true,
            message: 'Completion report generated successfully',
            data: report,
        })
    } catch (error) {
        next(error)
    }
})

router.post('/complete/:id', AuthMiddleware, async (req, res, next) => {
    try {
        await tasksService.completeTask(req.userId, req.params.id)
        return res.status(200).json({
            success: true,
            message: 'Task marked as completed successfully',
        })
    } catch (error) {
        next(error)
    }
})

// Get a specific task by ID
router.get('/:id', AuthMiddleware, async (req, res, next) => {
    try {
        const task = await tasksService.findById(req.params.id)

        return res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: task,
        })
    } catch (error) {
        next(error)
    }
})

// Update a task
router.patch(
    '/:id',
    AuthMiddleware,
    Body(UpdateTaskDto),
    async (req, res, next) => {
        try {
            const task = await tasksService.findById(req.params.id)

            // Check if the task belongs to the authenticated user
            if (task.userId !== req.userId) {
                throw AppError.forbidden(
                    'You do not have permission to update this task'
                )
            }

            const updatedTask = await tasksService.update(
                req.params.id,
                req.body
            )

            return res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: updatedTask,
            })
        } catch (error) {
            next(error)
        }
    }
)

// Delete a task
router.delete('/:id', AuthMiddleware, async (req, res, next) => {
    try {
        const task = await tasksService.findById(req.params.id)

        // Check if the task belongs to the authenticated user
        if (task.userId !== req.user.id) {
            throw AppError.forbidden(
                'You do not have permission to delete this task'
            )
        }

        await tasksService.delete(req.params.id)

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        })
    } catch (error) {
        next(error)
    }
})

// Generate a report on task completion rates
router.get('/reports', AuthMiddleware, async (req, res, next) => {
    try {
        // Admin can generate report for all tasks, regular users only for their own
        const options = req.userType === 'admin' ? {} : { userId: req.userId }

        // Generate completion report
        const report = await tasksService.generateCompletionReport(options)

        return res.status(200).json({
            success: true,
            message: 'Completion report generated successfully',
            data: report,
        })
    } catch (error) {
        next(error)
    }
})

export default router
