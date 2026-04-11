import { jest } from "@jest/globals";

// Mock data store
const mockDataStore = {
  users: [],
  missingPersons: [],
  campaigns: [],
  donations: [],
  shelters: [],
  helpRequests: [],
  locations: []
};

// Mock User model
const mockUserModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  save: jest.fn()
};

// Mock MissingPerson model
const mockMissingPersonModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  createIndexes: jest.fn().mockResolvedValue(true)
};

// Mock Campaign model
const mockCampaignModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
};

// Mock Donation model
const mockDonationModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
};

// Mock Shelter model
const mockShelterModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
};

// Mock HelpRequest model
const mockHelpRequestModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
};

// Mock Location model
const mockLocationModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
};

// Mock mongoose connection
const mockMongoose = {
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    collections: {},
    readyState: 1,
    close: jest.fn().mockResolvedValue(true)
  },
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockReturnValue('mockObjectId')
  }
};

// Mock axios with proper structure
const mockAxios = {
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Mock bcryptjs
const mockBcrypt = {
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn().mockResolvedValue(true)
};

// Mock jsonwebtoken
const mockJwt = {
  sign: jest.fn().mockReturnValue("mocktoken"),
  verify: jest.fn().mockReturnValue({ id: "mockuserid", email: "test@example.com" })
};

// Mock nodemailer
const mockNodemailer = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  })
};

// Mock socket.io
const mockSocketIO = {
  Server: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    engine: {
      clientsCount: 0
    }
  })
};

// Helper functions to manage mock data
export const mockHelpers = {
  clearAllData: () => {
    Object.keys(mockDataStore).forEach(key => {
      mockDataStore[key] = [];
    });
  },
  
  addUser: (userData) => {
    const user = {
      _id: `user_${Date.now()}`,
      ...userData,
      passwordHash: userData.passwordHash || "hashedpassword",
      isAccountVerified: userData.isAccountVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true)
    };
    mockDataStore.users.push(user);
    return user;
  },
  
  findUserByEmail: (email) => {
    return mockDataStore.users.find(user => user.email === email);
  },
  
  findUserById: (id) => {
    return mockDataStore.users.find(user => user._id === id);
  }
};

// Setup mock implementations
mockUserModel.findOne.mockImplementation((query) => {
  if (query.email) {
    const user = mockHelpers.findUserByEmail(query.email);
    return Promise.resolve(user || null);
  }
  return Promise.resolve(null);
});

mockUserModel.findById.mockImplementation((id) => {
  const user = mockHelpers.findUserById(id);
  return Promise.resolve(user || null);
});

mockUserModel.create.mockImplementation((userData) => {
  const user = mockHelpers.addUser(userData);
  return Promise.resolve(user);
});

// Export all mocks
export {
  mockDataStore,
  mockUserModel,
  mockMissingPersonModel,
  mockCampaignModel,
  mockDonationModel,
  mockShelterModel,
  mockHelpRequestModel,
  mockLocationModel,
  mockMongoose,
  mockAxios,
  mockBcrypt,
  mockJwt,
  mockNodemailer,
  mockSocketIO
};
