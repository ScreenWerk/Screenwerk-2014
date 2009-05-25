<?php

class Screen extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Screen_model', 'screen');
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Schedule_model', 'schedule');
		$this->load->model('Playlist_model', 'playlist');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->screen->get_list();
		$view['page_menu_code'] = 'screen';
		$view['page_content'] = $this->load->view('screen/screen_list', $view, True);

		$view['box']['screen_box']['hidden'] = TRUE;
		$view['box']['screen_box']['content'] = $this->load->view('screen/screen_box', $view, True);

		$this->load->view('main_page_view', $view);
	}



	function view($id) {
		$view = $this->screen->get_one($id);
		//print_r($view);
		$this->load->view('screen/screen_box', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->screen->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete')) {
			$this->screen->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		$data = $this->screen->get_one($id);
		
		$data['dimension']['value'] = $data['dimension_id'];
		unset($data['dimension_id']);
		foreach($this->dimension->get_names_list() as $dimension_key => $dimension_value) {
			$data['dimension']['list'][$dimension_key] = $dimension_value;
		}
		$data['schedule']['value'] = $data['schedule_id'];
		unset($data['schedule_id']);
		foreach($this->schedule->get_names_list() as $schedule_key => $schedule_value) {
			$data['schedule']['list'][$schedule_key] = $schedule_value;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'screen';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
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
		
		$screen = $this->screen->get_one($screen_id);
		
		$dir = 'images/';
		
		$file = 'status_red.png';
		if($screen['last_seen'] < 300) $file = 'status_yellow.png';
		if($screen['last_seen'] < 60) $file = 'status_green.png';
		if($screen['last_seen'] < 1) $file = 'empty.png';

		if(read_file($dir.$file)) {
			header('Content-Type: image/png');
			print(file_get_contents($dir.$file));
		}

	}
	

}
?>
