<div id="screen_content">

<?php if(isset($name)) { ?>

	<h1><?= $name; ?></h1>
	<b>Last seen: </b><br /><?= ($last_seen) ? $last_seen_inwords .' ago' : 'Never'; ?><br /><br />
	<b>Dimensions: </b><br /><?= isset($width) ? $width .'x'. $height : ''; ?><br /><br />
	<b>MD5: </b><br /><?= $screen_md5; ?><br /><br />
	<b>Media: </b><br /><?= implode(', ', $media); ?><br /><br />
	<b>Bundles: </b><br /><?= implode(', ', $bundles); ?><br /><br />
	<b>Layouts: </b><br /><?= implode(', ', $layouts); ?><br /><br />
	<b>Collections: </b><br /><?= implode(', ', $collections); ?><br /><br />
	<b>Schedule: </b><br /><?= $schedule; ?><br /><br />
	
	<button id="download-player" class="ui-button ui-state-default ui-corner-all" style="outline: 0; margin:0; padding: .4em 1em .5em; text-decoration:none;  !important; cursor:pointer; position: relative; text-align: center;">Download Player</button>

	<script type="text/javascript">

		$('#download-player').click(function() {
			top.location.href = '<?= site_url('/screen/get_player/'. $id); ?>';
		})
		.hover(
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