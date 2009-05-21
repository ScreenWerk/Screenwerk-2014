<h1 style="margin-bottom: 0px;"></h1>
<table class="data_table" style="width: 100%; margin-bottom:20px;" cellpadding="0" cellspacing="0">

<?php

	foreach($data as $row): 
		if($row['synchronized']) {
			$generate_playlist = anchor(site_url($this->router->class .'/generate_playlist/'.  $row['id']), 'Generate Playlist');
		} else {
			$generate_playlist = '&nbsp;';	
		}

?>

	<tr id="row_<?= $row['id']; ?>" style="cursor: pointer;">
		<td style="width:20px"><img src="<?= base_url(); ?>screen/status/<?= $row['id']; ?>" width="16px" height="16px" alt="" /></td>
		<td><b><?= $row['name']; ?></b></td>
		<td><?= isset($row['width']) ? $row['width'] .'x'. $row['height'] : '&nbsp;'; ?></td>
		<td style="text-align:right;"><?= $row['schedule']; ?></td>
	</tr>


<?php endforeach; ?>

</table>

<script type="text/javascript">
	$(document).ready(function(){
		$("tr").click(function () {
			var nr = $(this).attr('id'); 
			nr = nr.substring(4);
			$("#screen_content").load("<?= base_url(); ?>screen/view/"+nr);
			$("#screen_box").fadeIn("slow");
			$("tr").css("background","none");
			$(this).css("background","#D1DAF6");
		});
	});
</script>

<?php

	if(isset($page_submenu)) {
		foreach($page_submenu as $sub_key => $sub_value) {
			echo '<br />'. anchor(site_url($sub_key), $sub_value);
		}
	}

?>