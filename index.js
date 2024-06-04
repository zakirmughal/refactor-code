// #### Refactor Code ##########
// 1. create arrow function instead of normal function
exports.inviteUser = async (req, res) => {
  // 2. Handle the exception, Wrap the code in try & catch
  try {
    // 3. Assignment of variable with const because it will not change.
    const {invitationBody} = req.body;
    const {shopId} = req.params;
    const authUrl = "https://url.to.auth.system.com/invitation";

    // 4. Call API with async instead of callback, it will overcome callback hell.
    const invitationResponse = await superagent.post(authUrl).send(invitationBody);

    // If status 200 then return error
    if (invitationResponse.status === 200) {
      // return with error.
      return res.status(400).send({
        error: true,
        message: 'User already invited to this shop'
      });
    } else if (invitationResponse.status === 201) {
      // Assignment of variable
      const {authId, invitationId} = invitationResponse.body

      // 5. Get User if exist otherwise create & return.
      const createdUser = await User.findOneAndUpdate({authId}, {
        authId,
        email: invitationBody.email
      }, {
        upsert: true,
        new: true
      });

      // 6. Get Shop
      const shop = await Shop.findOne({shopId});

      // If shop not found return error.
      if (!shop) {
        return res.status(500).send({
          error: true,
          message: 'No shop found'
        });
      }

      // 7. Check if shop has invitation ID otherwise save in shop invitation
      if (!shop.invitations.includes(invitationId)) {
        shop.invitations.push(invitationId);
      }
      // 8. Check if shop has user ID otherwise save in shop user
      if (!shop.users.includes(createdUser._id)) {
        shop.users.push(createdUser);
      }

      // 9. Update shop
      await shop.save();
      // return response
      return res.status(200).send({
        error: false,
        data: {...invitationResponse.body}
      });
    }

    // return error
    return res.status(500).send({
      error: false,
      data: {...invitationResponse.body},
      message: "Something wrong in authentication"
    });
  } catch (err) {
    return res.status(500).send({message: err.message});
  }
}
