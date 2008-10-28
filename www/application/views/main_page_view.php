<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head profile="http://gmpg.org/xfn/11">
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		
		<title>Screenwerk : <?= humanize(plural($this->router->class)); ?></title>
		
		<link rel="stylesheet" type="text/css" media="screen" href="<?= site_url(); ?>css/screen.css" />
		<link rel="stylesheet" type="text/css" media="screen" href="<?= site_url(); ?>css/tabs.css" />
		<link rel="stylesheet" type="text/css" media="screen" href="<?= site_url(); ?>css/basic.css" />

<script>
function confirm_delete()
{
  if (confirm("Are you sure you want to delete?")==true)
    return true;
  else
    return false;
}
</script>

	</head>
	<body>
		<h1>Screenwerk</h1>
		<div id="header">
			<?php $this->load->view('main_page_menu_view'); ?>
		</div>
		<div id="main">
			<div id="contents">
				<?= $page_content; ?>
			</div>
		</div>

	</body>
</html>
