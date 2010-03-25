<?php

class Media_model extends Model {

	function __construct() {
		parent::Model();
	}



	function get_list($id = NULL) {
		$this->db->select('id, filename, duration, width, height, type');
		$this->db->from('medias');
		if(!$id) $this->db->where('customer_id', $this->sess->customer_id);
		if ($id) $this->db->where('id', $id);
		$this->db->order_by('type'); 
		$this->db->order_by('filename'); 
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['duration'] = $this->_secondsToWords($data[$row['id']]['duration']);
				if($data[$row['id']]['type'] != 'VIDEO') $data[$row['id']]['duration'] = null;
				if($data[$row['id']]['type'] != 'VIDEO' AND $data[$row['id']]['type'] != 'IMAGE') $data[$row['id']]['dimension'] = null;
				$data[$row['id']]['status'] = $this->media_status($row['id']);
				if($id) $data[$row['id']]['bundles'] = $this->media_bundles($row['id']);
				if($id) $data[$row['id']]['layouts'] = $this->media_layouts($row['id']);
				if($id) $data[$row['id']]['collections'] = $this->media_collections($row['id']);
				if($id) $data[$row['id']]['schedules'] = $this->media_schedules($row['id']);
				if($id) $data[$row['id']]['screens'] = $this->media_screens($row['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
		$row = $this->get_list($id);
		if(count($row) > 0) return $row[$id];	
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



	function media_status($media_id) {
	
		$status = '';
	
		$this->db->select('MAX(bundle_id) AS bundle_id');
		$this->db->select('MAX(layout_id) AS layout_id');
		$this->db->select('MAX(collection_id) AS collection_id');
		$this->db->select('MAX(schedule_id) AS schedule_id');
		$this->db->select('MAX(screen_id) AS screen_id');
		$this->db->from('v_relations');
		$this->db->where('v_relations.media_id', $media_id);
		$query = $this->db->get();
		
		$row = $query->row();
		if($row->bundle_id) $status = 'B';
		if($row->layout_id) $status = 'L';
		if($row->collection_id) $status = 'C';
		if($row->schedule_id) $status = 'S';
		if($row->screen_id) $status = 'SS';

		return $status;
	}



	function media_bundles($media_id) {
		$this->db->select('bundles.id, bundles.name');
		$this->db->from('bundles');
		$this->db->join('v_relations', 'v_relations.bundle_id = bundles.id');
		$this->db->where('bundles.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.media_id', $media_id);
		$this->db->order_by('bundles.name');
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row['name'];
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function media_layouts($media_id) {
		$this->db->select('layouts.id, layouts.name');
		$this->db->from('layouts');
		$this->db->join('v_relations', 'v_relations.layout_id = layouts.id');
		$this->db->where('layouts.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.media_id', $media_id);
		$this->db->order_by('layouts.name');
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row['name'];
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function media_collections($media_id) {
		$this->db->select('collections.id, collections.name');
		$this->db->from('collections');
		$this->db->join('v_relations', 'v_relations.collection_id = collections.id');
		$this->db->where('collections.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.media_id', $media_id);
		$this->db->order_by('collections.name');
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row['name'];
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function media_schedules($media_id) {
		$this->db->select('schedules.id, schedules.name');
		$this->db->from('schedules');
		$this->db->join('v_relations', 'v_relations.schedule_id = schedules.id');
		$this->db->where('schedules.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.media_id', $media_id);
		$this->db->order_by('schedules.name');
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row['name'];
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function media_screens($media_id) {
		$this->db->select('screens.id, screens.name');
		$this->db->from('screens');
		$this->db->join('v_relations', 'v_relations.screen_id = screens.id');
		$this->db->where('screens.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.media_id', $media_id);
		$this->db->order_by('screens.name');
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row['name'];
			}
		} else {
			$data = array();
		}

		return $data;
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
