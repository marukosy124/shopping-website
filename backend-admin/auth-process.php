<?php
session_start();

include_once('auth.php');
include_once('csrf.php');

include_once('lib/db.inc.php');
// header('Access-Control-Allow-Origin: *');
// header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');


$action = $_REQUEST['action'];
// get csrf for change pw
try {
  if (!empty($action) && $action === 'getNonce' && !empty($_GET['params'])) {
    if ($returnVal = csrf_getNonce($_GET['params'])) {
      echo json_encode(array('success' => $returnVal));
      exit();
    } else {
      echo json_encode(array('failed' => 'Request failed'));
      exit();
    }
  }
} catch (Exception $e) {
  echo json_encode(array('failed' => $e->getMessage()));
  exit();
}

// input validation
if (empty($action) || !preg_match('/^\w+$/', $action)) {
  echo json_encode(array('failed' => 'undefined'));
  exit();
}

// verify csrf
try {
  if (!empty($_POST['nonce'])) {
    csrf_verifyNonce($action, $_POST['nonce']);
  }
} catch (Exception $e) {
  echo json_encode(array('failed' => $e->getMessage()));
}

// The following calls the appropriate function based to the request parameter $_REQUEST['action'],
// the return values of the functions are then encoded in JSON format and used as output
try {
  if (($returnVal = call_user_func('ierg4210_' . $action)) === false) {
    global $db;
    if ($db && $db->errorCode())
      error_log(print_r($db->errorInfo(), true));
    echo json_encode(array('failed' => 'Request failed'));
    return;
  }
  echo json_encode(array('success' => $returnVal));
} catch (PDOException $e) {
  echo json_encode(array('failed' => $e->getMessage()));
  // header('Content-Type: text/html; charset=utf-8');
  // echo 'Database error.<br/><a href="javascript:history.back();">Back to previous page</a>';
} catch (Exception $e) {
  if ($action === 'login') {
    header('Content-Type: text/html; charset=utf-8');
    echo $e->getMessage() . '<br/><a href="javascript:history.back();">Back to login page</a>';
  } else {
    echo json_encode(array('failed' => $e->getMessage()));
  }
}

function ierg4210_login()
{
  $email = $_POST['email'];
  $password = $_POST['password'];
  $sanitizedEmail = filter_var($email, FILTER_SANITIZE_EMAIL);

  if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL) || empty($email) || empty($password) || !preg_match("/^[\w=+\-\/][\w='+\-\/\.]*@[\w\-]+(\.[\w\-]+)*(\.[\w]{2,6})$/", $email) || !preg_match("/^[\w@#$%\^\&\*\-]+$/", $password)) {
    throw new Exception('Wrong credentials');
  }

  global $db;
  $db = ierg4210_DB();
  $q = $db->prepare("SELECT * FROM users WHERE email = ?");
  $q->execute(array($email));
  if ($result = $q->fetch()) {
    $hashedPassword = hash_hmac('sha256', $password, $result['salt']);
    if ($hashedPassword == $result['password']) {
      $exp = time() + 3600 * 24 * 3;  // 3 days
      $token = array(
        'em' => $result['email'],
        'ad' => $result['is_admin'],
        'exp' => $exp,
        'k' => hash_hmac('sha256', $exp . $result['password'], $result['salt'])
      );
      // create cookie
      setcookie('auth', json_encode($token), $exp, '', '', true, true);
      // store in session
      $_SESSION['auth'] = $token;

      if ($result['is_admin']) {
        header('Location: admin.php', true, 302);
      } else {
        // header("Location: http://localhost", true, 302);
        // header("Location: https://secure.s27.ierg4210.ie.cuhk.edu.hk/", true, 302);
        header("Location: index.html", true, 302);
      }
      session_regenerate_id();
      exit();
    }
  }
  throw new Exception('Wrong credentials');
}

function ierg4210_logout()
{
  if (!empty($_SESSION['auth'])) {
    session_destroy();
  }
  if (!empty($_COOKIE['auth'])) {
    unset($_COOKIE['auth']);
    setcookie('auth', null, -1);
  }
  header('Location: login.php', true, 302);
  // header('Location: https://secure.s27.ierg4210.ie.cuhk.edu.hk/admin/login.php', true, 302);
  exit();
}

function ierg4210_change_password()
{
  if (empty($_SESSION['auth']) || empty($_COOKIE['auth'])) {
    throw new Exception('Not authenticated');
  }

  $email = $_POST['email'];
  $oldPassword = $_POST['old_password'];
  $newPassword = $_POST['new_password'];
  $sanitizedEmail = filter_var($email, FILTER_SANITIZE_EMAIL);

  if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL) || empty($email) || empty($oldPassword) || empty($newPassword) || !preg_match("/^[\w=+\-\/][\w='+\-\/\.]*@[\w\-]+(\.[\w\-]+)*(\.[\w]{2,6})$/", $email) || !preg_match("/^[\w@#$%\^\&\*\-]+$/", $oldPassword) || !preg_match("/^[\w@#$%\^\&\*\-]+$/", $newPassword)) {
    throw new Exception('Wrong credentials');
  }

  global $db;
  $db = ierg4210_DB();
  $q = $db->prepare("SELECT * FROM users WHERE email = ?");
  $q->execute(array($email));
  if ($result = $q->fetch()) {
    $hashedPassword = hash_hmac('sha256', $oldPassword, $result['salt']);
    if ($hashedPassword == $result['password']) {
      $newSalt = uniqid(mt_rand(), true); // more unique salt
      $hashedPassword = hash_hmac('sha256', $newPassword, $newSalt);
      $q = $db->prepare("UPDATE users SET password = ?, salt = ? WHERE email = ?");
      $q->execute(array($hashedPassword, $newSalt, $email));
      ierg4210_logout();
    }
  }
  throw new Exception('Wrong credentials');
}
