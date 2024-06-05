# Refactoring Code

Below is a Node.js function that a developer has written. It is an express middleware that processes `users` invitations to use private `shops`.
 * `req` and `res` are the `express` request and response objects
 * `superagent` is a module that makes http requests and is on npm
 * `"User"` and `"Shop"` are mongoose models

```
exports.inviteUser = function(req, res) {
  var invitationBody = req.body;
  var shopId = req.params.shopId;
  var authUrl = "https://url.to.auth.system.com/invitation";

  superagent
    .post(authUrl)
    .send(invitationBody)
    .end(function(err, invitationResponse) {
      if (invitationResponse.status === 201) {
        User.findOneAndUpdate({
          authId: invitationResponse.body.authId
        }, {
          authId: invitationResponse.body.authId,
          email: invitationBody.email
        }, {
          upsert: true,
          new: true
        }, function(err, createdUser) {
          Shop.findById(shopId).exec(function(err, shop) {
            if (err || !shop) {
              return res.status(500).send(err || { message: 'No shop found' });
            }
            if (shop.invitations.indexOf(invitationResponse.body.invitationId)) {
              shop.invitations.push(invitationResponse.body.invitationId);
            }
            if (shop.users.indexOf(createdUser._id) === -1) {
              shop.users.push(createdUser);
            }
            shop.save();
          });
        });
      } else if (invitationResponse.status === 200) {
        res.status(400).json({
          error: true,
          message: 'User already invited to this shop'
        });
        return;
      }
      res.json(invitationResponse);
    });
};

```

# Step 1
Analyse the function below and provide answers to the following questions:
 * What do you think is wrong with the code, if anything?
    I noticed two problems: the first is `Callback Hell` and the second is that it's always saving invitation doesn't matter if it already exists or not: `if (shop.invitations.indexOf(invitationResponse.body.invitationId))`, `=== -1` is missing. The correct syntax is `if (shop.invitations.indexOf(invitationResponse.body.invitationId)=== -1)`

 * Can you see any potential problems that could lead to exceptions
    The code is written very old coding style, I noticed that `no exception handling` and response is not standardized. it should be standardized like
    ```
    {
      error: true,
      message: 'Error message' // if error true
      data: {} // if error false
    }
    ```

 * How would you refactor this code to, Make it easier to read, Increase code reusability, Improve the stability of the system, Improve the testability of the code
    I will describe some point here instead of using of regular function use `arrow function`. using `var` but values are not changing in function better use `const`. Avoiding callback hell, I will use `async/await` function, better use `includes` instead of `indexOf` for readability.


# Step 2
 * Provide a sample refactor with changes and improvements you might make.
 For refactor code, you can find it `index.js`
