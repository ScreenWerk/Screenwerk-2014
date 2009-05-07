<?php

class User extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}
	        
	function index() {
		redirect('user/login');
	}


	
	function login() {

			if($this->input->post('login')) {
				$this->sess->login($this->input->post('user_name'), md5($this->input->post('user_secret')));
				$url = $this->session->userdata('redirect_url');
				if($url == FALSE) {
					redirect(key($this->sess->menu));
				} else {
					$this->session->unset_userdata('redirect_url');
					redirect($url);
				}
			}

			$view['page_menu_code'] = 'user/login';
			$view['page_content'] = $this->load->view('user/loginform', $view, True);
			$this->load->view('main_page_view', $view);

	}



	function logout() {
		$this->sess->logout();
		redirect('');
	}

}

?>
