<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

/*

Sessioonihalduse, kasutajate õiguste, sisselogimise jm toimingute klass. Asendab CI enda session klassi

*/

class CI_Session {



	var $id;
	var $username;
	var $redirect_url;
	var $forms;



	function CI_Session() {

		if(!isset($_SESSION)) session_start();
		
		//CI klassi kasutamine
		$this->CI =& get_instance();
		$this->CI->load->database();
		$this->CI->load->helper('url');

		
		if(isset($_SESSION['user']['id'])) { //kui sessioon olemas vaatame kas kehtib
			
			if($this->_session_check($_SESSION['user']['id'])==False) { //session ei kehti - suuname login formile
				$this->logout();
				redirect('user/login');
				exit();
			}
			
			//loeme andmed sessioonist klassi
			$this->_load_data();

		}

	}
	



//logib kasutaja sisse ja loeb kasutaja andmed sesioonimuutujatesse
	function login($name = Null, $password = Null) { 


		session_unset();
		session_destroy();
		session_start();
		session_regenerate_id();

		//loeme baasist kasutaja andmed
		
		$this->CI->db->select('id, customer_id, username');
		$this->CI->db->where('username', $name);
		$this->CI->db->where('secret', $password);
		$this->CI->db->limit(1);
		$user = $this->CI->db->get('users')->row();

		if(isset($user->id)) { //sisselogimine õnnestus

			//salvestame sessiooni tabelisse
			$this->CI->db->set('sid', session_id());
			$this->CI->db->set('user_id', $user->id);
			$this->CI->db->set('ip', $_SERVER['REMOTE_ADDR']);
			$this->CI->db->set('os', $_SERVER['HTTP_USER_AGENT']);
			$this->CI->db->insert('sessions');

			//lisame useri login countile ühe
			$this->CI->db->set('login_count', 'login_count + 1', FALSE);
			$this->CI->db->where('id', $user->id);
			$this->CI->db->update('users');

			//loeme useri väärtused sessioonimuutujasse
			$_SESSION['user']['id'] = $user->id;
			$_SESSION['user']['customer_id'] = $user->customer_id;
			$_SESSION['user']['username'] = $user->username;

			//võtame kasutaja formide listi
			$this->CI->db->select('f.code, f.name');
			$this->CI->db->distinct();
			$this->CI->db->from('forms AS f');
			$this->CI->db->join('forms_groups AS fg', 'fg.form_id = f.id');
			$this->CI->db->join('groups_users AS gu', 'gu.group_id = fg.group_id');
			$this->CI->db->where('gu.user_id', $user->id);
			$this->CI->db->order_by('f.ordinal');
			$forms = $this->CI->db->get();
			foreach($forms->result() as $form) {
				$forms_array[$form->code] = $form->name;
			}
			
			$_SESSION['forms'] = $forms_array;

			//loeme andmed sessioonist klassi
			$this->_load_data();

			$vastus = True;

		} else { //sisselogimine ei õnnestunud

			$vastus = False;

		}

		return $vastus;

	}




//logib kasutaja välja
	function logout() { 
		$this->login();
	}




//kontrollib kas leht on kaitstud ja suunab sisselogimislehele kui vaja
	function protect($page = Null, $gotologin = True) {

		if(!isset($page)) $page = $this->CI->uri->segment(1, '') .'/'. $this->CI->uri->segment(2, 'index');
		
 		if(!isset($this->forms[$page])) { //leht ei ole piiratud
			if($gotologin == True) { //suuname login aknale kui on kästud
				if(!isset($_SESSION['user']['redirect_url'])) {
					$_SESSION['user']['redirect_url'] = $this->CI->uri->uri_string(); //salvestame soovitud urli sessiooni
					$this->redirect_url = $this->CI->uri->uri_string(); //salvestame soovitud urli klassi
				}
				redirect('user/login');
				exit();

			} else {
				exit();
			}
			
		}
	}
	



//kontrollib sessiooni
	function _session_check($user_id) {

		$this->CI->db->where('(UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(time))/60 <=', 15);
		$this->CI->db->where('sid', session_id());
		$this->CI->db->where('user_id', $user_id);
		$this->CI->db->where('ip', $_SERVER['REMOTE_ADDR']);
		$this->CI->db->where('LEFT(os, 200) =', substr($_SERVER['HTTP_USER_AGENT'], 0, 200));
		$query = $this->CI->db->get('sessions');

		if($query->num_rows!=0) { //sessioni rida leiti ja uuendatakse kuupäeva
			$this->CI->db->set('time', 'NOW()', FALSE);
			$this->CI->db->where('id', $query->row()->id);
			$this->CI->db->update('sessions');
			$vastus = True;			
		} else { //sessioon on aegunud logime kasutaja välja
			$vastus = False;
		}
		
		return $vastus;

	}




//loeb kasutaja väärtused sessioonist klassi
	function _load_data() { 
		
		$this->id = $_SESSION['user']['id'];
		$this->username = $_SESSION['user']['username'];
		if(isset($_SESSION['user']['redirect_url'])) $this->redirect_url = $_SESSION['user']['redirect_url'];
		if(isset($_SESSION['data'])) $this->data = $_SESSION['data'];
		if(isset($_SESSION['forms'])) $this->forms = $_SESSION['forms'];

	}



}

?>
