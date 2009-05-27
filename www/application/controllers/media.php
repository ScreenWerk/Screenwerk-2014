<?php

class Media extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Media_model', 'media');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['upload_folder'] = '/'. $this->sess->customer_id .'/';

		$view['data'] = $this->media->get_list();
		
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
		$this->load->helper('file');

		$view = $this->media->get_one($id);

		if($view['type'] == 'URL') {
			$file = DIR_FTP_MASTERS .'/'. $view['id'] .'.URL';
			$url = read_file($file);
			if($url) $view['url'] = trim($url);
		}


		$this->load->view('media/media_box', $view);
	}

	
	function thumbnail($size, $media_id, $thumb_no = null) {

		$this->load->helper('download');
		$this->load->helper('file');
		
		if($size != 's') $size = '';

		$dir = DIR_FTP_THUMBS .'/';
		
		if($thumb_no) {
			$file = $media_id .'_'. $thumb_no . $size .'.jpg';
		} else {
			$file = $media_id . $size .'.jpg';
		}

		if(read_file($dir.$file)) {
			header('Content-Type: image/jpeg');
			print(file_get_contents($dir.$file));
		} else {
			header('Content-Type: image/png');
			print(file_get_contents('images/empty.png'));
		}

	}

}
?>
