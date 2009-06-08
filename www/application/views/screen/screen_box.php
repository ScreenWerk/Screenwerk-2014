<div id="screen_content">

<?php if(isset($name)) { ?>

	<h1><?= $name; ?></h1>
	<b>Last seen: </b><br /><?= ($last_seen) ? $last_seen_inwords .' ago' : 'Never'; ?><br /><br />

<?php 
	if(isset($width)) echo '<b>Dimensions: </b><br />'. $width .'x'. $height .'<br /><br />';
	if(isset($screen_md5)) echo '<b>MD5: </b><br />'. $screen_md5 .'<br /><br />';
	if(count($media)>0) echo '<b>Media: </b><br />'. implode(', ', $media) .'<br /><br />';
	if(count($bundles)>0) echo '<b>Bundles: </b><br />'. implode(', ', $bundles) .'<br /><br />';
	if(count($layouts)>0) echo '<b>Layouts: </b><br />'. implode(', ', $layouts) .'<br /><br />';
	if(count($collections)>0) echo '<b>Collections: </b><br />'. implode(', ', $collections) .'<br /><br />';
	if(isset($schedule)) echo '<b>Schedule: </b><br />'. $schedule .'<br /><br />';
	if(count($players)>0) {
		echo '<b>Players: </b><br />';
		foreach($players as $player) {	
			echo '<span title="'. $player['ip'] .' ('. $player['country'] .') - '.$player['player_version'] .' - '.$player['os'] .'">'. date('d.m.y H:i', strtotime($player['last_seen'])) .' '. substr($player['player_md5'], 0, 20) .'...<br /></span>';
		}
		echo '<br />';
	}
	//$sync_state = (!$synchronized) ? 'ui-state-default' : 'ui-state-disabled';
?>
	<div style="text-align: center;">
		<button id="download" class="ui-button ui-state-default ui-corner-left">Get Player</button>
		<button id="publish" class="ui-button ui-state-default <? $sync_state; ?>" style="margin-left: -5px;">Publish</button>
		<button id="edit" class="ui-button ui-state-default ui-corner-right" style="margin-left: -5px;">Edit</button>
	</div>
	
	<div id="playlist-updated" style="margin-top: 20px; display:none; color:red"></div>

	<script type="text/javascript">

		$('#publish').click(function() {
			$("#playlist-updated").load("<?= site_url('/screen/generate_playlist/'. $id); ?>");
			$("#playlist-updated").fadeIn("slow");

		});
		$('#download').click(function() {
			top.location.href = '<?= site_url('/screen/get_player/'. $id); ?>';
		});
		
		$('#delete').click(function() {
			if(confirm("Do you really want to delete this screen?")==true) {
				top.location.href = '<?= site_url('/screen/delete/'. $id); ?>';
			}
		});
		
		$('button').hover(
			function(){ 
				$(this).addClass("ui-state-hover"); 
			},
			function(){ 
				$(this).removeClass("ui-state-hover"); 
			}
		).mousedown(function(){
			$(this).addClass("ui-state-active"); 
		})
		.mouseup(function(){
				$(this).removeClass("ui-state-active");
		});

	</script>

<?php } ?>

</div>
