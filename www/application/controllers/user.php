<?php

class User extends Controller {

	function __construct() {
		parent::Controller();
//		$this->output->enable_profiler(TRUE);      
	}
	        
	function index() {
		$this->session->protect('user');
	}


	
	function login() {
		$this->session->login('argo','pass');
		echo '<pre>';
	//	print_r($this->session);
		echo '<pre>';
	}



	function test() {
		$this->session->protect();
		//print_r($this->session);
	}



	function logout() {
		$this->session->logout();
	}



}

?>
