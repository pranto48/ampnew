<?php
require_once 'includes/bootstrap.php';

logoutUser();
header('Location: login.php');
exit;
?>