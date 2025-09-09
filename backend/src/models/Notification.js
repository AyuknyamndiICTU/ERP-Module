const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'recipient_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'reminder'),
    defaultValue: 'info'
  },
  category: {
    type: DataTypes.ENUM('academic', 'finance', 'system', 'complaint', 'deadline', 'general'),
    defaultValue: 'general'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  isPopup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_popup'
  },
  popupShown: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'popup_shown'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true
});

module.exports = Notification;
