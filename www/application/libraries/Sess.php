<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

/*

Sessioonihalduse, kasutajate õiguste, sisselogimise jm toimingute klass. Asendab CI enda session klassi

*/

class Sess {



	var $user_id;
	var $username;
	var $customer_id;
	var $customername;
	var $forms;
	var $menu;
	var $redirect_url;


	function Sess() {

		//CI klassi kasutamine
		$this->CI =& get_instance();
		$this->CI->load->database();
		$this->CI->load->library('session');
		$this->CI->load->helper('url');
		
		$this->_load_data();
		
		if($this->user_id == FALSE) { //sessiooni pole olemas - logime sisse
			$this->login();
		} else { //sessioon olemas - vaatame kas on õigus lehele
		}
		
		$this->_protection_check();

	}
	


//logib kasutaja sisse ja loeb kasutaja andmed sesioonimuutujatesse
	function login($name = Null, $password = Null) { 

		//andmed nulli
		$this->_trunc_data();
		
		//loeme baasist kasutaja andmed
		$this->CI->db->select('id, customer_id, username');
		$this->CI->db->where(array('username'=>$name,'secret'=>$password));
		$this->CI->db->or_where('id', 1);
		$this->CI->db->order_by('id', 'desc');
		$this->CI->db->limit(1);
		$user = $this->CI->db->get('users')->row();

		//võtame kasutaja formide listi
		$this->CI->db->select('f.code, f.name, f.is_menu_item_yn AS menu');
		$this->CI->db->distinct();
		$this->CI->db->from('forms AS f');
		$this->CI->db->join('forms_groups AS fg', 'fg.form_id = f.id');
		$this->CI->db->join('groups_users AS gu', 'gu.group_id = fg.group_id');
		$this->CI->db->where('gu.user_id', $user->id);
		$this->CI->db->order_by('f.ordinal');
		$forms = $this->CI->db->get();
		
		foreach($forms->result() as $form) {
			$user_forms[$form->code] = $form->name;
			if($form->menu == 'Y') $user_menu[$form->code] = $form->name;
		}

		//lisame useri login countile ühe
		$this->CI->db->set('login_count', 'login_count + 1', FALSE);
		$this->CI->db->set('login_date', 'NOW()', FALSE);
		$this->CI->db->where('id', $user->id);
		$this->CI->db->update('users');

		//useri väärtused klassi ja sessiooni
		$this->user_id = $user->id;
		$this->customer_id = $user->customer_id;
		$this->username = $user->username;
		$this->forms = $user_forms;
		$this->menu = $user_menu;
		$this->_save_data();

		if($user->id != 1) { //sisselogimine õnnestus
			$vastus = True;
		} else { //sisselogimine ei õnnestunud
			$vastus = False;
		}

		return $vastus;

	}




//logib kasutaja välja
	function logout() { 
		$this->login();
		redirect('');
	}



//kontrollib sessiooni
	function _protection_check() {
		
		$url = '';
		if($this->CI->router->class .'/'. $this->CI->router->method != 'user/login') $url = current_url();
		
		if(isset($this->forms[$this->CI->router->class .'/'. $this->CI->router->method]) OR isset($this->forms[$this->CI->router->class])) { //formi õiguse rida leiti
			//print_r($this->forms);
			//echo $url;
		
		} else { //formi õiguse rida ei leitud
			$this->CI->session->set_userdata('redirect_url', $url);
			$this->_trunc_data();
			redirect('user/login');
			exit;
		}

	}



//loeb kasutaja väärtused sessioonist klassi
	function _load_data() { 
	
		$data = $this->CI->session->userdata('current_user');
		
		$this->user_id = $data['user_id'];
		$this->username = $data['username'];
		$this->customer_id = $data['customer_id'];
		$this->customername = $data['customername'];
		$this->forms = $data['forms'];
		$this->menu = $data['menu'];

	}



//salvestab kasutaja väärtused sessiooni
	function _save_data() { 
		
		$data = array(
			'user_id' => $this->user_id,
			'username' => $this->username,
			'customer_id' => $this->customer_id,
			'customername' => $this->customername,
			'forms' => $this->forms,
			'menu' => $this->menu,
		);
		
		$this->CI->session->set_userdata('current_user', $data);

	}



//kustutab kasutaja väärtused
	function _trunc_data() { 
		
		$this->CI->session->unset_userdata('current_user');

	}



}

?>