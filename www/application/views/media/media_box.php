<div id="media_content">

<?php 

if(isset($filename)) {
	
	$skimming = '';
	$img_width = '';
	$img_height = '';
	
	if($type=='VIDEO') $skimming = 'usemap="#skimming"';
	
	$img_width = 250;
	if(isset($dimension)) {
		$dimensions = explode("x", $dimension);
		$img_height = $img_width / ($dimensions[0] / $dimensions[1]);
	}
?>
	<h1><?= $filename; ?></h1>
	<center>
		<img id="media_img" src="<?= base_url(); ?>media/thumbnail/b/<?= $id; ?>" style="margin-bottom: 5px;" width="<?= $img_width ?>" height="<?= $img_height ?>" <?= $skimming ?> alt="" />
	</center>
	<b>Type: </b><br /><?= $type; ?><br /><br />
	<b>Duration: </b><br /><?= $duration; ?><br /><br />
	<b>Dimensions: </b><br /><?= isset($width) ? $width .'x'. $height : ''; ?><br /><br />
	<b>Bundles: </b><br /><?= implode(', ', $bundles); ?><br /><br />
	<b>Layouts: </b><br /><?= implode(', ', $layouts); ?><br /><br />
	<b>Collections: </b><br /><?= implode(', ', $collections); ?><br /><br />
	<b>Schedules: </b><br /><?= implode(', ', $schedules); ?><br /><br />
	<b>Screens: </b><br /><?= implode(', ', $screens); ?><br /><br />

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
