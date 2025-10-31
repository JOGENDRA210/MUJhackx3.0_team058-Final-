const User = require('./models/User');
const Assessment = require('./models/Assessment');
const Portfolio = require('./models/Portfolio');

class DatabaseService {
  // User operations
  static async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .populate('projects')
        .populate('assessments');
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email })
        .populate('projects')
        .populate('assessments');
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Assessment operations
  static async createAssessment(assessmentData) {
    try {
      const assessment = new Assessment(assessmentData);
      await assessment.save();
      
      // Add assessment to user's assessments array
      await User.findByIdAndUpdate(
        assessmentData.userId,
        { $push: { assessments: assessment._id } }
      );
      
      return assessment;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  static async getAssessmentsByUserId(userId) {
    try {
      const assessments = await Assessment.find({ userId });
      return assessments;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  // Portfolio operations
  static async createPortfolio(portfolioData) {
    try {
      const portfolio = new Portfolio(portfolioData);
      await portfolio.save();
      
      // Add portfolio to user's projects array
      await User.findByIdAndUpdate(
        portfolioData.userId,
        { $push: { projects: portfolio._id } }
      );
      
      return portfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  static async getPortfoliosByUserId(userId) {
    try {
      const portfolios = await Portfolio.find({ userId });
      return portfolios;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;