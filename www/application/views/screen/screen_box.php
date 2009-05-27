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
			echo date('d.m.y H:i', strtotime($player['last_seen'])) .' '. substr($player['player_md5'], 0, 20) .'...<br />';
		}
	}
	
	if(!$synchronized) echo '<button id="generate-playlist" class="ui-button ui-state-default ui-corner-all" style="float:right;">Publish</button>';
?>
	
	<button id="download-player" class="ui-button ui-state-default ui-corner-all">Download Player</button>

	<div id="playlist-updated" style="margin-top: 20px; display:none; color:red"></div>

	<script type="text/javascript">

		$('#generate-playlist').click(function() {
			$("#playlist-updated").load("<?= site_url('/screen/generate_playlist/'. $id); ?>");
			$("#playlist-updated").fadeIn("slow");

		});
		$('#download-player').click(function() {
			top.location.href = '<?= site_url('/screen/get_player/'. $id); ?>';
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
