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
				$data[$row['id']]['bundles'] = $this->media_bundles($row['id']);
				$data[$row['id']]['layouts'] = $this->media_layouts($row['id']);
				$data[$row['id']]['collections'] = $this->media_collections($row['id']);
				$data[$row['id']]['schedules'] = $this->media_schedules($row['id']);
				$data[$row['id']]['screens'] = $this->media_screens($row['id']);
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
	
	
	
	function media_bundles($media_id) {
		$this->db->select('bundles.id, bundles.name');
		$this->db->from('bundles');
		$this->db->join('medias_bundles', 'medias_bundles.bundle_id = bundles.id');
		$this->db->where('bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.media_id', $media_id);
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
		$this->db->join('bundles_layouts', 'bundles_layouts.layout_id = layouts.id');
		$this->db->join('medias_bundles', 'medias_bundles.bundle_id = bundles_layouts.bundle_id');
		$this->db->where('layouts.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bundles_layouts.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.media_id', $media_id);
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
		$this->db->join('layouts_collections', 'layouts_collections.collection_id = collections.id');
		$this->db->join('bundles_layouts', 'bundles_layouts.layout_id = layouts_collections.layout_id');
		$this->db->join('medias_bundles', 'medias_bundles.bundle_id = bundles_layouts.bundle_id');
		$this->db->where('collections.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('layouts_collections.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bundles_layouts.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.media_id', $media_id);
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
		$this->db->join('collections_schedules', 'collections_schedules.schedule_id = schedules.id');
		$this->db->join('layouts_collections', 'layouts_collections.collection_id = collections_schedules.collection_id');
		$this->db->join('bundles_layouts', 'bundles_layouts.layout_id = layouts_collections.layout_id');
		$this->db->join('medias_bundles', 'medias_bundles.bundle_id = bundles_layouts.bundle_id');
		$this->db->where('schedules.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('collections_schedules.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('layouts_collections.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bundles_layouts.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.media_id', $media_id);
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
		$this->db->join('collections_schedules', 'collections_schedules.schedule_id = screens.schedule_id');
		$this->db->join('layouts_collections', 'layouts_collections.collection_id = collections_schedules.collection_id');
		$this->db->join('bundles_layouts', 'bundles_layouts.layout_id = layouts_collections.layout_id');
		$this->db->join('medias_bundles', 'medias_bundles.bundle_id = bundles_layouts.bundle_id');
		$this->db->where('screens.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('collections_schedules.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('layouts_collections.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bundles_layouts.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('medias_bundles.media_id', $media_id);
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
