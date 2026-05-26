// Mock user data
export const mockUser = {
  id: "usr_001",
  email: "farmer@example.com",
  name: "John Smith",
  phoneNumber: "+1 234 567 8900",
  location: "California, USA",
  farmSize: "150 acres",
  avatar: null,
  preferences: {
    notifications: true,
    emailUpdates: true,
    language: "en",
  },
  createdAt: "2024-01-15",
};

// Mock authentication
export async function login(email, password) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (email === "demo@example.com" && password === "password") {
    return {
      success: true,
      user: mockUser,
      token: "mock_jwt_token_123",
    };
  }

  return {
    success: false,
    error: "Invalid email or password",
  };
}

export async function signup(data) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    user: {
      ...mockUser,
      email: data.email,
      name: data.name,
    },
    token: "mock_jwt_token_456",
  };
}

export async function getProfile() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockUser;
}

export async function updateProfile(updates) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    user: { ...mockUser, ...updates },
  };
}
