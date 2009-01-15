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
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('screen_table_view', $view, True);
		$this->load->view('main_page_view', $view);
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
         $_source = DIR_FTP_ORIGINALS . '/' . $media['id'];
         $_destination = DIR_FTP_SCREENS . '/' . $screen_id . '/' . $media['id'] . '.' . $media['type'];

         if(is_file($_destination)) unlink($_destination);
         link($_source, $_destination);
      }
		redirect( $this->uri->segment( 1 ) );
      return;



      //
      // initial method for playlist propagation
      //
      // $screen_id = $this->router->segments[3];
      $no_of_days = 3; //$this->router->segments[4];
      $pl_data = $this->playlist->create_playlist_for_screen( $screen_id, $no_of_days );

      //print_r( $bloated_playlist );      return;
      
      $pl_days =& $pl_data['PlaylistDays'];
      $pl_medias =& $pl_data['PlaylistMedias'];

      $ftp_dirname = "../ftp";

      /*
       * Iterate through all involved medias.
       * */
      $source_dirname = $ftp_dirname . "/originals";
      $target_dirname = $ftp_dirname . "/convert";
      //**/print_r( $pl_medias );
      foreach( $pl_medias as $target_name => $source_name )
      {
         copy( $source_dirname . "/" . $source_name,
               $target_dirname . "/" . $target_name );
      }


      /*
       * Iterate through all playlist days.
       * */
      $dirname = $ftp_dirname . "/screens";
      foreach( $pl_days as $pl_day )
      {
         $playlist = implode( "\n", $pl_day->events );

         $filename = $dirname . "/" . $screen_id . "_" . 
                     $pl_day->CronDate->year . $pl_day->CronDate->month . $pl_day->CronDate->day . '.events';
         file_put_contents( $filename, $playlist );
      }

      /*
       * Update md5
       * */
		$data = $this->screen->get_one( $screen_id );
      $data['content_md5'] = $this->screen->md5( $screen_id );
      $this->screen->db->where( 'id', $screen_id );
      $this->screen->db->update( 'screens', $data );

      
		redirect( $this->uri->segment( 1 ) );

   }

}
?>
