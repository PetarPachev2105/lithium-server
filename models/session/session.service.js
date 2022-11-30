const Session = require('./session.model');
const IDGenerator = require('../../lib/idGenerator');

/**
 * Returns a Session object, with associated User object, if we have one for the given accessToken
 * @param accessToken
 */
async function getSession(accessToken) {
  const sessionEntries = await Session
    .query()
    .where('access_token', accessToken)
    .withGraphFetched('[user(onlyIdAndUsername)]')
      .modifiers({
        onlyIdAndUsername(builder) {
          builder.select('id', 'username');
        },
      });

  return sessionEntries.length > 0 ? sessionEntries[0] : null;
}

/**
 * Deletes a session object from postgres
 * @param accessToken
 */
async function deleteSession(accessToken) {
  await Session
    .query()
    .delete()
    .where('access_token', accessToken);
}


/**
 * Creates a new session in Postgres
 * @param accessToken
 * @param user
 * @returns {Promise<*>}
 */
async function createSession(accessToken, user) {
  /* Check to make sure that we don't already have a dependency stored for these two ids */
  const existingSession = await Session
    .query()
    .where({
      access_token: accessToken,
      user_id: user.id,
    }).limit(1).first();

  if (existingSession) {
    // console.log(`createSession => found existing object for ${accessToken} = ${userId};`);
    // console.log(JSON.stringify(existingSession));
    return existingSession;
  }

  /* If we got here, there is no existing object. Let's create one */
  const insertPayload = {
    id: IDGenerator.generateUUID(),
    access_token: accessToken,
    user_id: user.id,
    created_at: new Date(),
  };
  // console.log(`insert payload: ${JSON.stringify(insertPayload)}`);
  const newSession = await Session
    .query()
    .insert(insertPayload);

  return newSession;
}


/**
 * Our exports
 * */
module.exports = {
  getSession,
  createSession,
  deleteSession,
};