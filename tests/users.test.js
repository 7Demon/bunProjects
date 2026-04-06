import { describe, expect, it } from "bun:test";
import { app } from "../src/index.js";

describe("User API Integration Tests", () => {
  const testUser = {
    name: "Test User",
    email: `test-${crypto.randomUUID()}@example.com`,
    password: "password123",
  };
  let userToken = "";
  let userId = null;

  // 1. POST /api/users (Register)
  describe("POST /api/users (Register)", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testUser),
        })
      );
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBe("OK");
    });

    it("should fail when registering with a duplicate email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testUser),
        })
      );
      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("email sudah terdaftar");
    });
  });

  // 2. POST /api/users/login (Login)
  describe("POST /api/users/login (Login)", () => {
    it("should login correctly and return a token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        })
      );
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      userToken = result.data;
    });

    it("should fail to login with a wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testUser.email,
            password: "wrongpassword",
          }),
        })
      );
      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("email atau password salah");
    });
  });

  // 3. GET /api/users (Get All)
  describe("GET /api/users", () => {
    it("should retrieve all users in an array", async () => {
      const response = await app.handle(new Request("http://localhost/api/users"));
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(Array.isArray(result)).toBe(true);
      
      const createdUser = result.find(u => u.email === testUser.email);
      expect(createdUser).toBeDefined();
      userId = createdUser.id;
    });
  });

  // 4. GET /api/users/:id (Get by ID)
  describe("GET /api/users/:id", () => {
    it("should retrieve a user by their valid ID", async () => {
      const response = await app.handle(new Request(`http://localhost/api/users/${userId}`));
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.email).toBe(testUser.email);
    });

    it("should return 404 for a non-existent user ID", async () => {
      const response = await app.handle(new Request("http://localhost/api/users/99999"));
      const result = await response.json();
      expect(response.status).toBe(404);
      expect(result.error).toBe("User tidak ditemukan");
    });
  });

  // 5. GET /api/users/current (Get Current Profile)
  describe("GET /api/users/current", () => {
    it("should retrieve the profile of the current user with a valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        })
      );
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data.email).toBe(testUser.email);
    });

    it("should return 401 when accessing without an Authorization header", async () => {
      const response = await app.handle(new Request("http://localhost/api/users/current"));
      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("unauthorized");
    });
  });

  // 6. DELETE /api/users/current (Delete Account)
  describe("DELETE /api/users/current", () => {
    it("should delete the currently logged-in user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${userToken}` },
        })
      );
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data.message).toBe("user berhasil dihapus");
    });

    it("should return 401 when retrieving profile after the account is deleted", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        })
      );
      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("unauthorized");
    });
  });
});
