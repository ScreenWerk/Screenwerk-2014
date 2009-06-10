<?php

class Screen extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Screen_model', 'screen');
		$this->load->model('Schedule_model', 'schedule');
		$this->load->model('Playlist_model', 'playlist');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->screen->get_list();
		$view['schedule_list'] = $this->schedule->get_names_list();
		$view['page_menu_code'] = 'screen';
		$view['page_content'] = $this->load->view('screen/screen_list', $view, True);

		$view['box']['screen_box']['hidden'] = TRUE;
		$view['box']['screen_box']['content'] = $this->load->view('screen/screen_box', $view, True);

		$view['box']['screen_edit']['content'] = $this->load->view('screen/screen_edit', $view, True);

		$this->load->view('main_page_view', $view);
	}



	function view($id) {
		$view = $this->screen->get_one($id);
		$view['schedule_list'] = $this->schedule->get_names_list();
		$this->load->view('screen/screen_box', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save') AND $this->input->post('name') AND $this->input->post('schedule')) {
			$id = $this->screen->update();
			if(!$this->input->post('id') AND isset($id)) {
				$screen = $this->screen->get_one($id);
				exec(DIR_FTP_PLAYERS .'/sign-player-installer.sh '. $screen['screen_md5']);
			}
		}
			
		if($this->input->post('delete')) {
			$this->screen->delete($this->input->post('id'));
		}

		redirect('screen');

	}



   function generate_playlist( $screen_id )
   {
      //
      // alternate method for playlist propagation
      //
      $pl_data = $this->playlist->regen_fs($screen_id);
      //print_r($pl_data);
      $screen_dir = DIR_FTP_SCREENS . '/' . $screen_id;

      if(!is_dir($screen_dir)) mkdir ($screen_dir);
      foreach( $pl_data['medias'] as $media )
      {
         $_source = DIR_FTP_MASTERS . '/' . $media['id'] . '.' . $media['type'];
         $_destination = DIR_FTP_SCREENS . '/' . $screen_id . '/' . $media['id'] . '.' . $media['type'];

         if(!is_file($_source)) die('missing ' . $_source);
         if(is_file($_destination)) unlink($_destination);
         link($_source, $_destination);
      }

/*
      $_source = DIR_FTP_SIGNALS . '/templates/rsync.signal.sh';
      $_destination = DIR_FTP_SIGNALS . '/' . $screen_id;
      if(is_file($_destination)) unlink($_destination);
      link($_source, $_destination);
*/
      

      $data['content_md5'] = $this->screen->md5( $screen_id );
      $this->screen->db->where( 'id', $screen_id );
      $this->screen->db->update( 'screens', $data );
      
	  echo 'Playlist generated';
	  
      return;

   }



	function get_player($screen_id) {
		
		$this->load->helper('download');
		$this->load->helper('file');
		
		$screen = $this->screen->get_one($screen_id);
		
		$md5 = $screen['screen_md5'];

		$dir = DIR_FTP_PLAYERS .'/';
		$screen_player = $dir .'/for_screens/'. $md5;
		
		if(read_file($screen_player)) {
			force_download('SWPlayer for '. $screen['name'] .'.air', file_get_contents($screen_player));
		} else {
			show_404('screen/get_player');
		}
	
	}



	function status($screen_id) {

		$this->load->helper('file');
		
		$status = $this->screen->get_status($screen_id);

		if($status) {
			$file = 'images/status_'. $status .'.png';
		} else {
			$file = 'images/empty.png';
		
		}

		if(read_file($file)) {
			header('Content-Type: image/png');
			print(file_get_contents($file));
		}

	}
	

}
?>
