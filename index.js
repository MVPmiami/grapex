const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const users = [
  { id: 1, username: 'Vasya', age: 25 },
  { id: 3, username: 'Alex', age: 28 },
  { id: 2, username: 'Masha', age: 29 },
]
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  enum Order {
    ASC
    DESC
  }
  input SortBy {
    field: String!
    order: Order!
  }
  type User {
    id: Int
    username: String
    age: Int
  }

  input UserInput {
    id: Int
    username: String!
    age: Int!
  }

  type Query {
    getAllUsers: [User!]
    getCurrentUser(id: Int): User!
    sorts(sortBy: SortBy): [User]
  }
  type Mutation {
    createUser(username: String!, age: Int!): User
  }
`
const resolvers = {
  Query: {
    getAllUsers: () => users,
    getCurrentUser: (parent, args) => {
      return users.find((user) => user.id == args.id)
    },
    sorts: async (obj, args, context) => {
      let sortedUsers = []
      if (args.sortBy.order === 'ASC') {
        sortedUsers = users.sort(function (a, b) {
          if (a.id > b.id) {
            return 1
          }
          if (a.id < b.id) {
            return -1
          }
          // a должно быть равным b
          return 0
        })
      } else {
        sortedUsers = users.sort(function (a, b) {
          if (a.id < b.id) {
            return 1
          }
          if (a.id > b.id) {
            return -1
          }
          // a должно быть равным b
          return 0
        })
      }
      return sortedUsers
    },
  },
  Mutation: {
    createUser(parent, args) {
      const newUser = args
      newUser.id = users.length + 1
      users.push(newUser)
      return newUser
    },
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

server.start().then((res) => {
  const app = express()
  server.applyMiddleware({ app })

  app.listen({ port: 3000 }, () =>
    console.log('Now browse to http://localhost:3000' + server.graphqlPath),
  )
})
