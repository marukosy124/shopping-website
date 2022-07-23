<?php
include_once('lib/db.inc.php');

function ierg4210_auth()
{
  if (!empty($_SESSION['auth'])) {
    return  array("email" => $_SESSION['auth']['em'], "is_admin" => $_SESSION['auth']['ad']);
  }
  if (!empty($_COOKIE['auth'])) {
    if ($token = json_decode(stripslashes($_COOKIE['auth']), true)) {
      // check expiry
      if (time() > $token['exp']) {
        return false;
      }
      global $db;
      $db = ierg4210_DB();
      $q = $db->prepare("SELECT * FROM users WHERE email = ?");
      $q->execute(array($token['em']));
      if ($result = $q->fetch()) {
        $realk = hash_hmac('sha256', $token['exp'] . $result['password'], $result['salt']);
        if ($realk == $token['k']) {
          $_SESSION['auth'] = $token;
          // need to return role for authorization later
          return array("email" => $token['em'], "is_admin" => $token['ad']);
        }
      }
    }
  }
  // bypass guests (admin actions and page will be rejected or redirected at admin.php or admin-process.php)
  if (!empty($_REQUEST['role']) && $_REQUEST['role'] == 'guest') {
    return true;
  }
  return false;
}
