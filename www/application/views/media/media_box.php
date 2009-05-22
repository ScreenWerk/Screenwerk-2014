<div id="media_content">

<?php 

if(isset($filename)) {
	
	$skimming = '';
	$img_width = '';
	$img_height = '';
	
	if($type=='VIDEO') $skimming = 'usemap="#skimming"';
	
	$img_width = 250;
	if(isset($width) AND isset($height)) {
		$img_height = round($img_width / ($width / $height));
	}
?>
	<h1><?= $filename; ?></h1>
	<center>
		<img id="media_img" src="<?= base_url(); ?>media/thumbnail/b/<?= $id; ?>" style="margin-bottom: 5px;" width="<?= $img_width ?>" height="<?= $img_height ?>" <?= $skimming ?> alt="" />
	</center>
	<b>Type: </b><br /><?= $type; ?><br /><br />

<?php 
	if(isset($duration)) echo '<b>Duration: </b><br />'. $duration .'<br /><br />';
	if(isset($width)) echo '<b>Dimensions: </b><br />'. $width .'x'. $height .'<br /><br />';
	if(isset($url)) echo '<b>URL: </b><br />'. anchor($url, $url) .'<br /><br />';
	if(count($bundles)>0) echo '<b>Bundles: </b><br />'. implode(', ', $bundles) .'<br /><br />';
	if(count($layouts)>0) echo '<b>Layouts: </b><br />'. implode(', ', $layouts) .'<br /><br />';
	if(count($collections)>0) echo '<b>Collections: </b><br />'. implode(', ', $collections) .'<br /><br />';
	if(count($schedules)>0) echo '<b>Schedules: </b><br />'. implode(', ', $schedules) .'<br /><br />';
	if(count($screens)>0) echo '<b>Screens: </b><br />'. implode(', ', $screens) .'<br /><br />';
?>
	<map name="skimming">
	
	<?php
		$count = 20;
		$step = ($img_width/$count);
		for ( $counter = ($img_width/$count); $counter <= $img_width; $counter += ($img_width/$count)) {
			echo '	<area shape="rect" coords="'. round($counter-$step) .',0,'. round($counter) .',250" alt="'. ($counter/$step) .'">' ."\n";
		}
	?>
	
	</map>

<?php
	for ( $counter = 1; $counter <= $count; $counter += 1) {
		echo '<img id="media_img_'. $counter .'" src="'. base_url() .'media/thumbnail/b/'. $id .'/'. $counter .'" style="display: none;" >' ."\n";
	}
?>

<script type="text/javascript">
	$(document).ready(function(){
		$('area').hover(function() { 
			var alt = $(this).attr('alt'); 
			var img = $("#media_img_"+alt).attr('src');
			$("#media_img").attr("src",img);
			return false; 
		});
	});
</script>

<?php } ?>

</div>
