<?php
	
	$type = '';
	$first = true;
	foreach($data as $row): 
		if($type != $row['type']) {
			$type = $row['type'];
			if($first == true) {
				$first = false;
			} else {
				echo '</table>';
			}
?>

<h1 style="margin-bottom: 0px;"><?= $row['type']; ?></h1>
<table class="data_table" style="width: 100%; margin-bottom:20px;" cellpadding="0" cellspacing="0">

<?php
		}

?>


	<tr id="row_<?= $row['id']; ?>" style="cursor: pointer;">
		<td style="width:20px"><img src="<?= base_url(); ?>media/thumbnail/s/<?= $row['id']; ?>" width="16px" height="16px" alt="" /></td>
		<td><b><?= $row['filename']; ?></b></td>
		<td style="text-align:right;"><?= $row['duration']; ?>&nbsp;</td>
		<td style="text-align:right;"><?= $row['dimension']; ?>&nbsp;</td>
	</tr>

<?php endforeach; ?>

</table>

<script type="text/javascript">
	$(document).ready(function(){
		$("tr").click(function () {
			var nr = $(this).attr('id'); 
			nr = nr.substring(4);
			$("#media_content").load("<?= base_url(); ?>media/view/"+nr);
			$("#media_box").fadeIn("slow");
			$("tr").css("background","none");
			$(this).css("background","#D1DAF6");
		});
	});
</script>
