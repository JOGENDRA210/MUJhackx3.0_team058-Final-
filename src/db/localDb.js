const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
// lightweight id generator to avoid ESM-only uuid import issues in CommonJS
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const DB_FILE = path.join(__dirname, '..', '..', 'db.json');

// Ensure folder exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new FileSync(DB_FILE);
const db = low(adapter);

// defaults
db.defaults({ users: [], assessments: [], portfolios: [] }).write();

// Local filesystem backed DB with the same method signatures as the mongoose service
module.exports = {
  async createUser(userData) {
  const id = generateId();
    const now = new Date().toISOString();
    const user = Object.assign({ _id: id, createdAt: now, updatedAt: now, assessments: [], portfolios: [] }, userData);
    db.get('users').push(user).write();
    return user;
  },

  async getUserByEmail(email) {
    return db.get('users').find({ email }).value() || null;
  },

  async getUserById(id) {
    return db.get('users').find({ _id: id }).value() || null;
  },

  async updateUser(id, updates) {
    const user = db.get('users').find({ _id: id }).assign(Object.assign({}, updates, { updatedAt: new Date().toISOString() })).write();
    return user || null;
  },

  async createAssessment(assessmentData) {
  const id = generateId();
    const now = new Date().toISOString();
    const assessment = Object.assign({ _id: id, createdAt: now, updatedAt: now }, assessmentData);
    db.get('assessments').push(assessment).write();

    // Attach to user if present
    if (assessment.userId) {
      const user = db.get('users').find({ _id: assessment.userId }).value();
      if (user) {
        db.get('users').find({ _id: assessment.userId }).get('assessments').push(assessment._id).write();
      }
    }

    return assessment;
  },

  async getAssessmentsByUserId(userId) {
    return db.get('assessments').filter({ userId }).value() || [];
  },

  async createPortfolio(portfolioData) {
  const id = generateId();
    const now = new Date().toISOString();
    const portfolio = Object.assign({ _id: id, createdAt: now, updatedAt: now }, portfolioData);
    db.get('portfolios').push(portfolio).write();

    if (portfolio.userId) {
      const user = db.get('users').find({ _id: portfolio.userId }).value();
      if (user) {
        db.get('users').find({ _id: portfolio.userId }).get('portfolios').push(portfolio._id).write();
      }
    }

    return portfolio;
  },

  async getPortfoliosByUserId(userId) {
    return db.get('portfolios').filter({ userId }).value() || [];
  }
};
