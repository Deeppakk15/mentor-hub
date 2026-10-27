import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { createNotification } from '../services/notifications/notificationService.js';

// Get tasks for a project
export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee } = req.query;

    let query = { project: projectId };
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (assignee && assignee !== 'All') query.assignee = assignee;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email profileImage')
      .populate('creator', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignee, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description: description ? description.trim() : '',
      assignee: assignee || null,
      creator: req.user._id,
      priority: priority || 'medium',
      status: 'todo',
      dueDate: dueDate || null,
    });

    // Notify assignee if not the creator
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignee,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you the task: "${task.title}".`,
        resourceType: 'Task',
        resourceId: task._id,
        link: `/student/tasks`,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email profileImage')
      .populate('creator', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Update task status, assignee, priority, etc.
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignee, priority, status, dueDate } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (assignee !== undefined) task.assignee = assignee || null;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();

    // Recalculate project progress based on completed tasks & approved milestones
    const totalTasks = await Task.countDocuments({ project: task.project });
    const completedTasks = await Task.countDocuments({ project: task.project, status: 'completed' });
    if (totalTasks > 0) {
      const taskRatio = completedTasks / totalTasks;
      const project = await Project.findById(task.project);
      if (project && project.status === 'approved') {
        // Progress reflects task completion up to 90% (final 10% is evaluation)
        const computedProgress = Math.min(90, Math.round(15 + taskRatio * 75));
        if (computedProgress > project.progress) {
          project.progress = computedProgress;
          await project.save();
        }
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email profileImage')
      .populate('creator', 'name email');

    res.json({
      message: 'Task updated successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(id);

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
