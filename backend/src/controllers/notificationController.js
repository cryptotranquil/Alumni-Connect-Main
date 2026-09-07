const notificationService = require("../services/notification.service");

const formatNotification = (n) => ({
  ...n,
  _id: n.id,
  createdAt: n.createdAt?.toDate ? n.createdAt.toDate().toISOString() : n.createdAt,
  updatedAt: n.updatedAt?.toDate ? n.updatedAt.toDate().toISOString() : n.updatedAt,
  readAt: n.readAt?.toDate ? n.readAt.toDate().toISOString() : n.readAt,
});

const getNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await notificationService.getUserNotifications(req.user.userId, parseInt(limit), parseInt(skip));
    const unreadCount = await notificationService.getUnreadCount(req.user.userId);
    res.json({
      success: true, notifications: notifications.map(formatNotification), unreadCount,
      pagination: { limit: parseInt(limit), skip: parseInt(skip), hasMore: notifications.length === parseInt(limit) },
    });
  } catch (error) { console.error("Get notifications error:", error); res.status(500).json({ success: false, message: "Server error" }); }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, notification: formatNotification(notification) });
  } catch (error) { console.error("Mark as read error:", error); res.status(500).json({ success: false, message: "Server error" }); }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) { console.error("Mark all as read error:", error); res.status(500).json({ success: false, message: "Server error" }); }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.user.userId);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) { console.error("Delete notification error:", error); res.status(500).json({ success: false, message: "Server error" }); }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.json({ success: true, unreadCount: count });
  } catch (error) { console.error("Get unread count error:", error); res.status(500).json({ success: false, message: "Server error" }); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount };