// src/models/index.js - PostgreSQL 모든 모델과 관계 정의
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// ===== 모델 정의 =====

// 1. User 모델
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'full_name'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'phone_number'
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 2. Team 모델
const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'creator_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'teams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 3. TeamMember 모델 (N:M 매핑)
const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'team_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'joined_at'
  }
}, {
  tableName: 'team_members',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['team_id', 'user_id']
    }
  ]
});

// 4. Meeting 모델
const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'team_id'
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'organizer_id'
  },
  meetingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'meeting_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  meetingType: {
    type: DataTypes.ENUM('online', 'offline', 'hybrid'),
    defaultValue: 'online',
    field: 'meeting_type'
  },
  meetingUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'meeting_url'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'meetings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 5. MeetingAttendee 모델
const MeetingAttendee = sequelize.define('MeetingAttendee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meetingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'meeting_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  attendanceStatus: {
    type: DataTypes.ENUM('invited', 'accepted', 'declined', 'tentative'),
    defaultValue: 'invited',
    field: 'attendance_status'
  },
  actualAttendance: {
    type: DataTypes.ENUM('attended', 'absent', 'late'),
    allowNull: true,
    field: 'actual_attendance'
  },
  invitedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'invited_at'
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at'
  }
}, {
  tableName: 'meeting_attendees',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['meeting_id', 'user_id']
    }
  ]
});

// 6. Minutes 모델 (회의록)
const Minutes = sequelize.define('Minutes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meetingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'meeting_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  // PostgreSQL JSONB 필드 추가
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'minutes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 7. WhenToMeet 모델
const WhenToMeet = sequelize.define('WhenToMeet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'team_id'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'creator_id'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  timeInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    field: 'time_interval'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  allowMultipleSelection: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_multiple_selection'
  },
  // PostgreSQL JSONB 필드
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'whentomeet',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 8. WhenToMeetSlot 모델
const WhenToMeetSlot = sequelize.define('WhenToMeetSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  whentomeetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'whentomeet_id'
  },
  slotDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'slot_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  }
}, {
  tableName: 'whentomeet_slots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 9. WhenToMeetResponse 모델
const WhenToMeetResponse = sequelize.define('WhenToMeetResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  whentomeetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'whentomeet_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'slot_id'
  },
  availability: {
    type: DataTypes.ENUM('available', 'maybe', 'unavailable'),
    defaultValue: 'available'
  }
}, {
  tableName: 'whentomeet_responses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'slot_id']
    }
  ]
});

// 10. Notification 모델
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('meeting_invite', 'meeting_reminder', 'whentomeet_invite', 'team_invite', 'general'),
    allowNull: false
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_id'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  // PostgreSQL JSONB 필드
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 11. UserSettings 모델
const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Asia/Seoul'
  },
  notificationEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notification_email'
  },
  notificationPush: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notification_push'
  },
  language: {
    type: DataTypes.ENUM('ko', 'en'),
    defaultValue: 'ko'
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark', 'auto'),
    defaultValue: 'light'
  },
  // PostgreSQL JSONB 필드
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'user_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 12. RefreshToken 모델
const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked'
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// ===== 모델 관계 설정 =====
const initializeAssociations = () => {
  // User 관계
  User.hasMany(Team, { foreignKey: 'creatorId', as: 'createdTeams' });
  User.hasMany(TeamMember, { foreignKey: 'userId' });
  User.hasMany(Meeting, { foreignKey: 'organizerId', as: 'organizedMeetings' });
  User.hasMany(MeetingAttendee, { foreignKey: 'userId' });
  User.hasMany(Minutes, { foreignKey: 'authorId', as: 'writtenMinutes' });
  User.hasMany(WhenToMeet, { foreignKey: 'creatorId', as: 'createdPolls' });
  User.hasMany(WhenToMeetResponse, { foreignKey: 'userId' });
  User.hasMany(Notification, { foreignKey: 'userId' });
  User.hasOne(UserSettings, { foreignKey: 'userId' });
  User.hasMany(RefreshToken, { foreignKey: 'userId' });

  // Team 관계
  Team.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
  Team.hasMany(TeamMember, { foreignKey: 'teamId' });
  Team.hasMany(Meeting, { foreignKey: 'teamId' });
  Team.hasMany(WhenToMeet, { foreignKey: 'teamId' });

  // TeamMember 관계
  TeamMember.belongsTo(User, { foreignKey: 'userId' });
  TeamMember.belongsTo(Team, { foreignKey: 'teamId' });

  // Meeting 관계
  Meeting.belongsTo(Team, { foreignKey: 'teamId' });
  Meeting.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
  Meeting.hasMany(MeetingAttendee, { foreignKey: 'meetingId' });
  Meeting.hasMany(Minutes, { foreignKey: 'meetingId' });

  // MeetingAttendee 관계
  MeetingAttendee.belongsTo(Meeting, { foreignKey: 'meetingId' });
  MeetingAttendee.belongsTo(User, { foreignKey: 'userId' });

  // Minutes 관계
  Minutes.belongsTo(Meeting, { foreignKey: 'meetingId' });
  Minutes.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

  // WhenToMeet 관계
  WhenToMeet.belongsTo(Team, { foreignKey: 'teamId' });
  WhenToMeet.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
  WhenToMeet.hasMany(WhenToMeetSlot, { foreignKey: 'whentomeetId', as: 'slots' });
  WhenToMeet.hasMany(WhenToMeetResponse, { foreignKey: 'whentomeetId', as: 'responses' });

  // WhenToMeetSlot 관계
  WhenToMeetSlot.belongsTo(WhenToMeet, { foreignKey: 'whentomeetId' });
  WhenToMeetSlot.hasMany(WhenToMeetResponse, { foreignKey: 'slotId' });

  // WhenToMeetResponse 관계
  WhenToMeetResponse.belongsTo(WhenToMeet, { foreignKey: 'whentomeetId' });
  WhenToMeetResponse.belongsTo(User, { foreignKey: 'userId' });
  WhenToMeetResponse.belongsTo(WhenToMeetSlot, { foreignKey: 'slotId' });

  // Notification 관계
  Notification.belongsTo(User, { foreignKey: 'userId' });

  // UserSettings 관계
  UserSettings.belongsTo(User, { foreignKey: 'userId' });

  // RefreshToken 관계
  RefreshToken.belongsTo(User, { foreignKey: 'userId' });

  // Many-to-Many 관계 (User <-> Team through TeamMember)
  User.belongsToMany(Team, {
    through: TeamMember,
    foreignKey: 'userId',
    otherKey: 'teamId',
    as: 'teams'
  });

  Team.belongsToMany(User, {
    through: TeamMember,
    foreignKey: 'teamId',
    otherKey: 'userId',
    as: 'members'
  });

  // Many-to-Many 관계 (User <-> Meeting through MeetingAttendee)
  User.belongsToMany(Meeting, {
    through: MeetingAttendee,
    foreignKey: 'userId',
    otherKey: 'meetingId',
    as: 'attendingMeetings'
  });

  Meeting.belongsToMany(User, {
    through: MeetingAttendee,
    foreignKey: 'meetingId',
    otherKey: 'userId',
    as: 'attendees'
  });
};

// ===== 인스턴스 메서드 추가 =====

// User 인스턴스 메서드
User.beforeCreate(async (user) => {
  if (user.password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  user.email = user.email.toLowerCase();
  user.username = user.username.toLowerCase();
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  if (user.changed('email')) {
    user.email = user.email.toLowerCase();
  }
  if (user.changed('username')) {
    user.username = user.username.toLowerCase();
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toSafeObject = function() {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

User.prototype.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  await this.save();
};

// User 클래스 메서드
User.findByEmail = async function(email) {
  return await this.findOne({
    where: { email: email.toLowerCase() }
  });
};

User.findByUsername = async function(username) {
  return await this.findOne({
    where: { username: username.toLowerCase() }
  });
};

// RefreshToken 인스턴스 메서드
RefreshToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

RefreshToken.prototype.revoke = async function() {
  this.isRevoked = true;
  await this.save();
};

// RefreshToken 클래스 메서드
RefreshToken.cleanupExpired = async function() {
  await this.destroy({
    where: {
      expiresAt: {
        [Sequelize.Op.lt]: new Date()
      }
    }
  });
};

RefreshToken.findValidToken = async function(token) {
  return await this.findOne({
    where: {
      token,
      isRevoked: false,
      expiresAt: {
        [Sequelize.Op.gt]: new Date()
      }
    },
    include: [User]
  });
};

// Minutes 인스턴스 메서드 (PostgreSQL 전문 검색)
Minutes.searchByContent = async function(keyword) {
  return await this.findAll({
    where: sequelize.literal(`to_tsvector('korean', content) @@ plainto_tsquery('korean', '${keyword}')`),
    order: [['created_at', 'DESC']]
  });
};

// ===== 데이터베이스 동기화 =====
const syncDatabase = async (force = false) => {
  try {
    // 관계 설정 초기화
    initializeAssociations();

    // 데이터베이스 동기화
    await sequelize.sync({ force });
    console.log('✅ PostgreSQL 데이터베이스 동기화 완료');

    // 초기 데이터 생성 (force=true인 경우에만)
    if (force) {
      await createInitialData();
    }
  } catch (error) {
    console.error('❌ 데이터베이스 동기화 실패:', error);
    throw error;
  }
};

// 초기 데이터 생성
const createInitialData = async () => {
  try {
    // 관리자 계정 생성
    const admin = await User.create({
      username: 'admin',
      email: 'admin@wayto.com',
      password: 'Admin123!',
      fullName: '시스템 관리자',
      isActive: true
    });

    // 관리자 설정 생성
    await UserSettings.create({
      userId: admin.id,
      timezone: 'Asia/Seoul',
      language: 'ko'
    });

    console.log('✅ 초기 데이터 생성 완료');
    console.log('   📧 Email: admin@wayto.com');
    console.log('   🔑 Password: Admin123!');
  } catch (error) {
    console.error('❌ 초기 데이터 생성 실패:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Team,
  TeamMember,
  Meeting,
  MeetingAttendee,
  Minutes,
  WhenToMeet,
  WhenToMeetSlot,
  WhenToMeetResponse,
  Notification,
  UserSettings,
  RefreshToken,
  syncDatabase,
  initializeAssociations
};
