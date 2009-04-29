<?php

class Media_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list($id = NULL) {
		$this->db->select('id, filename, length, type, dimension_id');
		$this->db->from('medias');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if ($id) $this->db->where('id', $id);
		$this->db->order_by('filename'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
				unset($data[$row['id']]['dimension_id']);
				$data[$row['id']]['length'] = $this->_secondsToWords($data[$row['id']]['length']);
				if($data[$row['id']]['type'] != 'VIDEO') $data[$row['id']]['length'] = null;
				if($data[$row['id']]['type'] != 'VIDEO' AND $data[$row['id']]['type'] != 'IMAGE') $data[$row['id']]['dimension'] = null;
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
		$row = $this->get_list($id);
		return $row[$id];	
	}



	function get_name($id) {
		$this->db->select('filename');
		$this->db->where('id', $id);
		$result = $this->db->get('medias');
		
		if ($result->num_rows() > 0) return $result->row()->filename;

	} 



	function get_names_list() {
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['filename'];
		endforeach;
		
		return $result;
	} 
	
	
	
	function _secondsToWords($secs) {
		$vals = array('w' => (int) ($secs / 86400 / 7), 
                      'd' => $secs / 86400 % 7, 
                      'h' => $secs / 3600 % 24, 
                      'm' => $secs / 60 % 60, 
                      's' => $secs % 60); 
 
        $ret = array(); 
 
        $added = false; 
        foreach ($vals as $k => $v) { 
            if ($v > 0 || $added) { 
                $added = true; 
                $ret[] = $v . $k; 
            } 
        } 
 
        return join(' ', $ret); 
	
	}

}

?>
