<div id="media_content">

<?php if(isset($filename)) { ?>
	<h1><?= $filename; ?></h1>
	<center>
		<img id="media_img" src="<?= base_url(); ?>media/thumbnail/<?= $id; ?>/1" style="margin-bottom: 5px;" width="250px" <?= ($type=='VIDEO') ? 'usemap="#skimming"' : '' ?> />
	</center>
	<b>Length: </b><?= $length; ?><br />
	<b>Dimensions: </b><?= $dimension; ?><br />

	<map name="skimming">
	
	<?php
		$count = 20;
		$width = 250;
		$step = ($width/$count);
		for ( $counter = ($width/$count); $counter <= $width; $counter += ($width/$count)) {
			echo '	<area shape="rect" coords="'. round($counter-$step) .',0,'. round($counter) .',250" alt="'. ($counter/$step) .'">' ."\n";
		}
	?>
	
	</map>

<?php
	for ( $counter = 1; $counter <= $count; $counter += 1) {
		echo '<img id="media_img_'. $counter .'" src="'. base_url() .'media/thumbnail/'. $id .'/'. $counter .'" style="display: none;" >' ."\n";
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