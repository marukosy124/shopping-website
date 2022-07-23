<?php
include_once('csrf.php');
session_start();

?>

<html>

<head>
  <title>Login</title>
  <link rel="stylesheet" type="text/css" href="style.css">
</head>

<body>
  <form method="POST" action="auth-process.php?action=<?php echo ($action = 'login'); ?>" enctype="multipart/form-data" class="auth-container">
    <fieldset>
      <legend align="center">Login</legend>
      <div class="login-field">
        <label for="email">Email</label>
        <div> <input id="email" type="text" name="email" required pattern="^[\w=+-/][\w='+-/.]*@[\w-]+(.[\w-]+)*(.[\w]{2,6})$" /></div>
        <label for=" email">Password</label>
        <div> <input id="password" type="password" name="password" required pattern="^[\w@#$%^&*-]+$" /></div>
      </div>
      <div class="login-btn">
        <input type="submit" value="Login" />
        <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
      </div>
    </fieldset>
  </form>
</body>

</html>