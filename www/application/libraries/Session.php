<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

/*

Sessioonihalduse, kasutajate õiguste, sisselogimise jm toimingute klass. Asendab CI enda session klassi

*/

class CI_Session {



	var $id;
	var $name;
	var $username;
	var $language;
	var $lib_count;
	var $lib_list1;
	var $lib_list2;
	var $is_guest;
	var $redirect_url;
	var $rights;
	var $data;



	function CI_Session() {
	
		if(!isset($_SESSION)) session_start();

		//CI klassi kasutamine
		$this->CI =& get_instance();
		$this->CI->load->database();
		$this->CI->load->helper('url');

		
		if(!isset($_SESSION['user']['id'])) { //kui pole sessioonis andmeid siis logime sisse
			$this->login();
		} else { //sessioon olemas vaatame kas kehtib
			if($this->_session_check($_SESSION['user']['id'])==False) {
				$this->logout();
			}
		}

		//loeme andmed sessioonist klassi
		$this->_load_data();

	}



//logib kasutaja sisse ja loeb kasutaja andmed sesioonimuutujatesse
	function login($name = Null, $password = Null, $idcard = Null) { 


		if($idcard) {
			//kasutatakse id kaarti sisenemiseks
			$lugeja_where = 'LOWER(idcard) = LOWER(\''. $idcard .'\')';
		} else {
			//kasutatakse nime ja parooli sisenemiseks
			$lugeja_where = 'LOWER(username) = LOWER(\''. $name .'\') AND password = \''. md5($password) .'\'';
		}

		//loeme baasist kasutaja andmed
		$user_array = $this->CI->db->query('
			SELECT
				u.id,
				u.username,
				CONCAT(u.firstname, \' \', u.lastname) AS name,
				u.language,
				COUNT(ul.library_id) lib_count
			FROM
				users AS u,
				users_libraries AS ul
			WHERE ul.user_id = u.id
			AND u.id = 1 OR ('. $lugeja_where .')
			GROUP BY
				u.id
			ORDER BY
				u.id DESC
			LIMIT 1
			')->row_array();

		//loeme baasist kasutaja raamatukogude őigused
		$user_libraries = $this->CI->db->query('
			SELECT
				ul.library_id,
				r.r_library
			FROM
				users_libraries AS ul,
				userrights AS r
			WHERE r.id = ul.userright_id
			AND ul.user_id = '. $user_array['id'] .'
			AND r.r_library > 0
			ORDER BY ul.library_id
			');

		$library_list1 = '';
		$library_list2 = '';
		foreach ($user_libraries->result_array() as $row) {
			if($row['r_library']==1) {
				$library_list1 .= ', '. $row['library_id'];
			}
			if($row['r_library']==2) {
				$library_list1 .= ', '. $row['library_id'];
				$library_list2 .= ', '. $row['library_id'];
			}
		}
		$library_list1 = substr($library_list1, 2);
		$library_list2 = substr($library_list2, 2);
		
		//käivitame sessiuni
		$this->_session_start($user_array['id']);
		
		//loeme kőik väärtused sessioonimuutujasse
		$_SESSION['user'] = $user_array;
		$_SESSION['user']['library_list1'] = $library_list1;
		$_SESSION['user']['library_list2'] = $library_list2;
		$_SESSION['rights'] = $this->_get_rights($user_array['id']);
		$_SESSION['data'] = array();
		
		if($user_array['id'] == 1){
			//sisselogimine ei õnnestunud
			$_SESSION['user']['is_guest'] = True;
			$vastus = FALSE;
		} else {
			//sisselogimine õnnestus
			$_SESSION['user']['is_guest'] = False;
			$vastus = TRUE;
		}

		//loeme andmed sessioonist klassi
		$this->_load_data();
		
		return $vastus;
		
	}




//logib kasutaja välja
	function logout() { 
		$this->login();
	}




//kontrollib kas leht on kaitstud ja suunab sisselogimislehele kui vaja
	function protect($page, $gotologin = True) {

		if(isset($this->rights[$page])) { //leht ei ole piiratud
			if($this->rights[$page]==0) { //kasutajal pole őigust lehte näha

				if($gotologin == True) { //suuname login aknale kui on kästud
					if(!isset($_SESSION['user']['redirect_url'])) {
						$_SESSION['user']['redirect_url'] = $this->CI->uri->uri_string(); //salvestame soovitud urli sessiooni
						$this->redirect_url = $this->CI->uri->uri_string(); //salvestame soovitud urli klassi
					}
					redirect('users/login');
					exit();

				} else {
					exit();
				}
			}
		}
	}
	



//tagastab sessiooni salvestatud andmed
	function data($key, $value = Null){
		if ($value) {
			$_SESSION['data'][$key] = $value;
		} else {
			if (array_key_exists($key, $_SESSION['data'])) return $_SESSION['data'][$key];
		}
	}




// tagastab menüü ja tabid
	function get_menu($current = Null) {
		
		if($_SESSION['rights']['library']>0) $vastus[$this->CI->lang1->str('library')][$this->CI->lang1->str('search')] = Array(
			'url' => 'library/search',
			'current' => ($current=='search') ? True : False
		);
		if($_SESSION['rights']['library']>0) $vastus[$this->CI->lang1->str('library')][$this->CI->lang1->str('catalogue')] = Array(
			'url' => 'library',
			'current' => ($current=='library') ? True : False
		);
		if($_SESSION['rights']['lending']>0) $vastus[$this->CI->lang1->str('lending')][$this->CI->lang1->str('lending')] = Array(
			'url' => 'lending',
			'current' => ($current=='lending')? True : False
		);
		if($_SESSION['rights']['users']>0) $vastus[$this->CI->lang1->str('lending')][$this->CI->lang1->str('users')] = Array(
			'url' => 'users',
			'current'=>($current=='users') ? True : False
		);
		if($_SESSION['rights']['groups']>0) $vastus[$this->CI->lang1->str('lending')][$this->CI->lang1->str('groups')] = Array(
			'url' => 'groups',
			'current'=>($current=='groups') ? True : False
		);

		$vastus[$this->CI->lang1->str('info')][$this->CI->lang1->str('help')] = Array(
			'url' => 'info/help',
			'current'=>($current=='help') ? True : False
		);
		$vastus[$this->CI->lang1->str('info')][$this->CI->lang1->str('contact')] = Array(
			'url' => 'info/contact',
			'current'=>($current=='contact') ? True : False
		);
		
		if($_SESSION['user']['is_guest']==false) $vastus[$_SESSION['user']['name']][$this->CI->lang1->str('preferences')] = Array(
			'url' => 'users/preferences',
			'current'=>($current=='preferences') ? True : False
		);		
		
		return $vastus;
		
	}

	


// tagastab kasutaja õiguste array
	function _get_rights($user_id) {
		
		$vastus = $this->CI->db->query('
			SELECT
				MAX(r_library) AS library,
				MAX(r_users) AS users,
				MAX(r_users) AS groups,
				MAX(r_users) AS lending,
				MAX(r_statistics) AS statistics,
				MAX(r_preferences) AS preferences,
				MAX(r_admin) AS admin
			FROM
				users_libraries AS ul,
				userrights AS r
			WHERE r.id = ul.userright_id
			AND ul.user_id = '. $user_id .'
			')->row_array();
		
		return $vastus;
		
	}

	


//alustab sessiooni
	function _session_start($user_id) {
	
		session_unset();
		session_destroy();
		session_start();
		session_regenerate_id();

		//salvestame sessiooni tabelisse
		$this->CI->db->query('
			INSERT INTO sessions SET
				sid = \''. session_id() .'\',
				username = (SELECT username FROM users WHERE id = '. $user_id .'),
				ip = \''. $_SERVER['REMOTE_ADDR'] .'\',
				os = \''. $_SERVER['HTTP_USER_AGENT'] .'\'
			');
		$this->CI->db->query('
			UPDATE users SET
				login_count = login_count + 1
			WHERE id = '. $user_id .'
			');

	}




//kontrollib sessiooni
	function _session_check($user_id) {

		$query = $this->CI->db->query('
			SELECT id
			FROM sessions
			WHERE (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(time))/60 <= 15
			AND sid = \''. session_id() .'\'
			AND username = (SELECT username FROM users WHERE id = '. $user_id .')
			AND ip = \''. $_SERVER['REMOTE_ADDR'] .'\'
			AND LEFT(os, 200) = LEFT(\''. $_SERVER['HTTP_USER_AGENT'] .'\', 200)
			');

		if($query->num_rows!=0) { //sessioni rida leiti ja uuendatakse kuupäeva
			$this->CI->db->query('UPDATE sessions SET time = NOW() WHERE id = '. $query->row()->id);
			$vastus = True;			
		} else { //sessioon on aegunud logime kasutaja välja
			$vastus = False;
		}
		
		return $vastus;

	}




//loeb kasutaja väärtused sessioonist klassi
	function _load_data() { 
		
		$this->id = $_SESSION['user']['id'];
		$this->name = $_SESSION['user']['name'];
		$this->username = $_SESSION['user']['username'];
		$this->CI->language = $_SESSION['user']['language'];
		$this->lib_count = $_SESSION['user']['lib_count'];
		$this->lib_list1 = $_SESSION['user']['library_list1'];
		$this->lib_list2 = $_SESSION['user']['library_list2'];
		$this->language = $_SESSION['user']['language'];
		$this->is_guest = $_SESSION['user']['is_guest'];
		if(isset($_SESSION['user']['redirect_url'])) $this->redirect_url = $_SESSION['user']['redirect_url'];

		$this->data = $_SESSION['data'];
		$this->rights = $_SESSION['rights'];

	}



}

?>