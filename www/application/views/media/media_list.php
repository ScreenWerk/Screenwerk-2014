<table class="data_table" style="width: 100%;" cellpadding="0" cellspacing="0">

<?php foreach($data as $row): ?>

	<tr id="row_<?= $row['id']; ?>" style="cursor: pointer;" alt="<?= $row['id']; ?>">
		<td style=""><img src="<?= base_url(); ?>media/thumbnail/s/<?= $row['id']; ?>" width="16px" height="16px" /></td>
		<td><b><?= $row['filename']; ?></b></td>
		<td style="text-align:right;"><?= $row['length']; ?></td>
		<td style="text-align:right;"><?= $row['dimension']; ?></td>
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