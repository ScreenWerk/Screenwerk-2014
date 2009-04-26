<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head profile="http://gmpg.org/xfn/11">
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		
		<title>Screenwerk : <?= humanize(plural($this->router->class)); ?></title>
		
		<link rel="stylesheet" type="text/css" media="screen" href="<?= base_url(); ?>css/screen.css" />
		
		<script src="http://www.google.com/jsapi"></script>
		<script>
			//google.load("prototype", "1.6");
			//google.load("scriptaculous", "1.8")
			google.load("jquery", "1")
		</script>
		<script type="text/javascript" src="<?= base_url(); ?>javascripts/uploadify/jquery.uploadify.js"></script>

	</head>
	<body>
		<div id="header">
			<img src="<?= base_url(); ?>images/sw-p128.png" style="float:right;" width="64px" height="64px" />
			Screenwerk
		</div>
		<div id="menu">
			<?php $this->load->view('main_page_menu_view'); ?>
		</div>
		<div id="spacer">
		</div>
		<div id="content">
			<div id="content_right">
				
				<div class="box_t"><div class="box_b"><div class="box_l"><div class="box_r"><div class="box_bl"><div class="box_br"><div class="box_tl"><div class="box_tr">
					<h1>Upload</h1>
						Lorem ipsum dolor sit amet consectetur adipisicing elit
				</div></div></div></div></div></div></div></div>
				
				
			</div>
			<div id="content_left">
				<?= $page_content; ?>
			</div>
		</div> 
		<div id="footer">
			<div id="footer_content">
				2009
			</div>
		</div>
	</body>
</html>
