<h1><?= $filename; ?></h1>
<center>
	<img id="img_<?= $id; ?>" src="<?= base_url(); ?>media/thumbnail/<?= $id; ?>/1" style="margin-bottom: 5px;" width="250px" <?= ($type=='VIDEO') ? 'usemap="#skimming"' : '' ?> />
</center>
<b>Length: </b><?= $length; ?><br />
<b>Dimensions: </b><?= $dimension; ?><br />

<script type="text/javascript">
	$(document).ready(function(){
		$("#row_<?= $id; ?>").click(function () {
			$(".box_hidden").hide();
			$("#media_<?= $id; ?>").fadeIn("normal");
			$("tr").css("background","none");
			$("#row_<?= $id; ?>").css("background","#D1DAF6");
		});

		$('area').hover(function() { 
			var alt = $(this).attr('alt'); 
			$("#img_<?= $id; ?>").attr("src","/media/thumbnail/<?= $id; ?>/"+alt);
			return false; 
		});

	});
</script>