import Notification from '../../models/Notification.js';

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  resourceType = '',
  resourceId = '',
  link = '',
}) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedResource: {
        resourceType,
        resourceId,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};
