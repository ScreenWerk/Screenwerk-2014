<h1><?= $filename; ?></h1>
<center>
	<img src="<?= base_url(); ?>media/thumbnail/<?= $id; ?>/1" style="margin-bottom: 10px;" width="270px"/>
</center>
<b>Length: </b><?= $length; ?><br />
<b>Dimensions: </b><?= $dimension; ?><br />



<script type="text/javascript">
	$(document).ready(function(){
		$("#row_<?= $id; ?>").click(function () {
			$(".box_hidden").slideUp("normal");
			$("#media_<?= $id; ?>").slideDown("normal");
			$("tr").css("background","none");
			$("#row_<?= $id; ?>").css("background","#D1DAF6");
		});    
	});
</script>