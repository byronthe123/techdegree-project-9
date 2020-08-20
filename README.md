# Project 9 - REST API Porject

This is a NodeJS backend project that is a REST API for a school system where users and courses and be added to the database. **Aiming for exceeds expectations: all bonus requirements completed.** 


## Programming Approach

This project uses SQLite and Sequelize for managing interactions with the database. *Async/Await* patterns are used for data fetching in routes and middleware is used to handle errors. The app allows the user to create, read, update, and delete users and courses in the database. **Bonus:** Users can only edit/delete their own courses. **Bonus:** Users with the same email address cannot be created twice. **Bonus:** When fetching users and courses, the password, createdAt, and updatedAt fields are not returned.

## Syntax and Conventions

The app is written in ES6 JavaScript. 
