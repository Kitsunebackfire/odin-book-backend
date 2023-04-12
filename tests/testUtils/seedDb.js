// used to get fake data to populate for users and schema properties
const { faker } = require("@faker-js/faker");

const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const bcrypt = require("bcrypt");

// users generated through faker
const testUsers = [];
const testPosts = [];

/* const genPass = async (password) => {
  const salt = await bcrypt.genSalt();
  hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const generateTestUser = async () => {
  const body = {
    username: "test",
    email: "test@gmail.com",
    password: "password123",
  };
  const newUser = new User(body);
  // console.log(newUser);
  testUsers.push(newUser);
}; */

const generateFakerUsers = async () => {
  const body = {
    username: faker.name.firstName(),
    email: faker.helpers.unique(faker.internet.email),
    password: faker.name.fullName(),
  };
  const newUser = new User(body);
  //await newUser.save();
  //console.log(newUser);
  testUsers.push(newUser);
};

const createFakePost = (user) => {
  const post = new Post({
    author: user._id,
    timestamp: faker.date.past(10),
    postContent: faker.lorem.sentences(2),
  });
  testPosts.push(post);
};

const genFakePosts = () => {
  testUsers.forEach((testUser) => {
    for (let i = 0; i < 3; i++) {
      createFakePost(testUser);
    }
  });
};

const seedDb = async () => {
  //console.log(faker.date.past(10));
  //generateTestUser();
  for (i = 0; i < 5; i++) {
    generateFakerUsers();
  }
  genFakePosts();
  testUsers.forEach(async (testUser) => {
    try {
      await testUser.save();
    } catch (err) {
      console.log("err trying to save test user," + err);
    }
  });

  testPosts.forEach(async (testPost) => {
    try {
      await testPost.save();
    } catch (err) {
      console.log("err trying to save test user," + err);
    }
  });

  //console.log(testPosts);
  //console.log(testUsers);
  return { testUsers, testPosts };
};

module.exports = seedDb;
