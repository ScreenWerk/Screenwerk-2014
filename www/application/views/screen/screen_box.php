<div id="screen_content">

<?php 

if(isset($name)) {
	
?>
	<h1><?= $name; ?></h1>
	<b>Last seen: </b><br /><?= ($last_seen) ? $last_seen_inwords .' ago' : 'Never'; ?><br /><br />
	<b>Dimensions: </b><br /><?= isset($width) ? $width .'x'. $height : ''; ?><br /><br />
	<b>MD5: </b><br /><?= $screen_md5; ?><br /><br />
	<b>Media: </b><br /><?= implode(', ', $media); ?><br /><br />
	<b>Bundles: </b><br /><?= implode(', ', $bundles); ?><br /><br />
	<b>Layouts: </b><br /><?= implode(', ', $layouts); ?><br /><br />
	<b>Collections: </b><br /><?= implode(', ', $collections); ?><br /><br />
	<b>Schedule: </b><br /><?= $schedule; ?><br /><br />

<?php } ?>

</div>
