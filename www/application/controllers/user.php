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
				$this->session->login($this->input->post('user_name'), md5($this->input->post('user_secret')));
				redirect('screen');
			}

			$view['page_menu_code'] = 'user/login';
			$view['page_content'] = $this->load->view('user_login_view', $view, True);
			$this->load->view('main_page_view', $view);

	}



	function logout() {
		$this->session->logout();
		redirect('info');
	}

}

?>
