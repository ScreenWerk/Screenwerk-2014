<?php

class Media extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Media_model', 'media');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['upload_folder'] = '/'. $this->session->customer_id .'/';

		$view['data'] = $this->media->get_list();
		
		foreach($view['data'] as $row_id => $row) {
			$view['data'][$row_id]['status'] = '';
			if($row['bundles']) $view['data'][$row_id]['status'] = 'B';
			if($row['layouts']) $view['data'][$row_id]['status'] = 'L';
			if($row['collections']) $view['data'][$row_id]['status'] = 'C';
			if($row['schedules']) $view['data'][$row_id]['status'] = 'S';
			if($row['screens']) $view['data'][$row_id]['status'] = '<b style="color: red;">S</b>';
		}
		
		$view['page_menu_code'] = 'media';
		$view['page_menu_code'] = 'media';
		$view['show_edit_link'] = isset($this->session->forms[$this->router->class .'']);
		$view['page_content'] = $this->load->view('media/media_list', $view, True);
		
		$view['box']['media_box']['hidden'] = TRUE;
		$view['box']['media_box']['content'] = $this->load->view('media/media_box', $view, True);

		$view['box']['upload']['content'] = $this->load->view('media/media_upload', $view, True);
		
		$this->load->view('main_page_view', $view);
	}

	function view($id) {
		$view = $this->media->get_one($id);
		$this->load->view('media/media_box', $view);
	}

	
	function thumbnail($size, $media_id, $thumb_no = null) {

		$this->load->helper('download');
		$this->load->helper('file');
		
		if($size != 's') $size = '';

		$dir = DIR_FTP_THUMBS .'/';
		
		if($thumb_no) {
			$file = $media_id .'_'. $thumb_no . $size .'.png';
		} else {
			$file = $media_id . $size .'.png';
		}
		
		if(read_file($dir.$file)) {
			header('Content-Type: image/png');
			print(file_get_contents($dir.$file));
		} else {
			header('Content-Type: image/png');
			print(file_get_contents('images/empty.png'));
		}
	}

}
?>
