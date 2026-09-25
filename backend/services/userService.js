const { pool } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');
const { logDebug } = require('../utils/helpers');

async function saveTerm(userId, name, program_id, year_level, semester) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const termResult = await client.query(
      'SELECT termid FROM term WHERE programid = $1 AND yearlevel = $2 AND semester = $3',
      [program_id, year_level, semester]
    );

    if (termResult.rows.length === 0) {
      const err = new Error('Invalid program, year level, or semester combination');
      err.status = 400;
      throw err;
    }

    const termID = termResult.rows[0].termid;
    logDebug('Found termID:', termID);

    let updateResult;
    if (name) {
      logDebug('Updating with name:', name);
      updateResult = await client.query(
        'UPDATE user_profile SET username = $1, termid = $2 WHERE userid = $3 RETURNING userid',
        [name, termID, userId]
      );
    } else {
      logDebug('Updating termid only');
      updateResult = await client.query(
        'UPDATE user_profile SET termid = $1 WHERE userid = $2 RETURNING userid',
        [termID, userId]
      );
    }

    if (updateResult.rows.length === 0) {
      const err = new Error('Failed to update user profile');
      err.status = 500;
      throw err;
    }

    await client.query('COMMIT');
    return { term_id: termID };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getTerm(userId, termIdParam) {
  if (termIdParam) {
    const result = await pool.query(
      `SELECT termid as term_id, programid as program_id, yearlevel as year_level, semester as semester, requnits as req_units
       FROM term
       WHERE termid = $1`,
      [termIdParam]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      const err = new Error('Term not found');
      err.status = 404;
      throw err;
    }
  }

  const result = await pool.query(
    `SELECT t.termid as term_id, t.programid as program_id, t.yearlevel as year_level, t.semester as semester, t.requnits as req_units
     FROM user_profile up
     JOIN term t ON up.termid = t.termid
     WHERE up.userid = $1`,
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

async function getSession(userId) {
  const result = await pool.query(
    `SELECT uc.userid, uc.useremail, uc.userpassword, uc.useraccess, up.username 
     FROM user_credentials uc 
     LEFT JOIN user_profile up ON uc.userid = up.userid 
     WHERE uc.userid = $1`,
    [userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const user = result.rows[0];
  let decryptedPassword = '';
  if (user.userpassword) {
    decryptedPassword = decrypt(user.userpassword);
  }

  return {
    user_id: user.userid,
    name: user.username,
    email: user.useremail,
    password: decryptedPassword,
    access: user.useraccess
  };
}

async function updateProfile(userId, username, email, password) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    if (email) {
      const checkEmail = await client.query(
        'SELECT userid FROM user_credentials WHERE useremail = LOWER($1) AND userid <> $2',
        [email, userId]
      );
      if (checkEmail.rows.length > 0) {
        const err = new Error('Email is already taken by another user');
        err.status = 400;
        throw err;
      }
      await client.query(
        'UPDATE user_credentials SET useremail = LOWER($1) WHERE userid = $2',
        [email, userId]
      );
    }

    if (password && password.trim() !== '') {
      const encryptedPassword = encrypt(password);
      await client.query(
        'UPDATE user_credentials SET userpassword = $1 WHERE userid = $2',
        [encryptedPassword, userId]
      );
    }

    if (username) {
      await client.query(
        'UPDATE user_profile SET username = $1 WHERE userid = $2',
        [username, userId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    throw err;
  } finally {
    if (client) client.release();
  }
}

async function deleteProfile(userId) {
  const result = await pool.query(
    'DELETE FROM user_credentials WHERE userid = $1 RETURNING userid',
    [userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
}

async function getUserPreferences(userId) {
  const result = await pool.query(
    'SELECT BlockedTimes FROM user_preferences WHERE userid = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    return { blockedTimes: [] };
  }
  return { blockedTimes: result.rows[0].blockedtimes || [] };
}

async function updateUserPreferences(userId, blockedTimes) {
  const result = await pool.query(
    `INSERT INTO user_preferences (userid, blockedtimes, updatedat) 
     VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP) 
     ON CONFLICT (userid) 
     DO UPDATE SET blockedtimes = EXCLUDED.blockedtimes, updatedat = CURRENT_TIMESTAMP 
     RETURNING blockedtimes`,
    [userId, JSON.stringify(blockedTimes)]
  );
  return { blockedTimes: result.rows[0].blockedtimes };
}

module.exports = {
  saveTerm,
  getTerm,
  getSession,
  updateProfile,
  deleteProfile,
  getUserPreferences,
  updateUserPreferences
};
