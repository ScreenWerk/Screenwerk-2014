<table class="data_table" style="width: 100%;" cellpadding="0" cellspacing="0">

<?php
		$type = '';
	foreach($data as $row): 
		if($type != $row['type']) {
			$type = $row['type'];
?>
</table>
<h1 style="margin-bottom: 0px;"><?= $row['type']; ?></h1>
<table class="data_table" style="width: 100%; margin-bottom:20px;" cellpadding="0" cellspacing="0">

<?php
		}

?>


	<tr id="row_<?= $row['id']; ?>" style="cursor: pointer;" alt="<?= $row['id']; ?>">
		<td style=""><img src="<?= base_url(); ?>media/thumbnail/s/<?= $row['id']; ?>" width="16px" height="16px" /></td>
		<td width="100%"><b><?= $row['filename']; ?></b></td>
		<td style="text-align:right;"><?= $row['duration']; ?>&nbsp;</td>
		<td style="text-align:right;"><?= $row['dimension']; ?>&nbsp;</td>
	</tr>

<?php endforeach; ?>

</table>

<script type="text/javascript">
	$(document).ready(function(){
		$("tr").click(function () {
			var alt = $(this).attr('alt'); 
			$("#media_content").load("<?= base_url(); ?>media/view/"+alt);
			$("#media_box").fadeIn("slow");
			$("tr").css("background","none");
			$(this).css("background","#D1DAF6");
		});
	});
</script>
