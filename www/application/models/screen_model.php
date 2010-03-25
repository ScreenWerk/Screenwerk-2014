<?php

class Screen_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Schedule_model', 'schedule');
	}



	function get_list($id = NULL, $screen_md5 = NULL) {

		$this->db->select('screens.id, screens.name, screens.schedule_id, schedules.name AS schedule, screens.width, screens.height, screens.screen_md5, screens.content_md5, TIMESTAMPDIFF(SECOND,screens.last_seen,NOW())+1 last_seen');
		$this->db->from('screens');
		$this->db->join('schedules', 'schedules.id = screens.schedule_id', 'left');
		if($screen_md5) $this->db->where('screens.screen_md5', $screen_md5);
		if(!$screen_md5) $this->db->where('screens.customer_id', $this->sess->customer_id);
		if(!$screen_md5) $this->db->where('schedules.customer_id', $this->sess->customer_id);
		if($id) $this->db->where('screens.id', $id);
		$this->db->order_by('name'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['last_seen_inwords'] = $this->_secondsToWords($data[$row['id']]['last_seen']);
				$data[$row['id']]['media'] = $this->screen_media($row['id']);
				$data[$row['id']]['bundles'] = $this->screen_bundles($row['id']);
				$data[$row['id']]['layouts'] = $this->screen_layouts($row['id']);
				$data[$row['id']]['collections'] = $this->screen_collections($row['id']);
				if($id) $data[$row['id']]['players'] = $this->screen_players($row['id']);
				if($id) $data[$row['id']]['synchronized'] = ($data[$row['id']]['content_md5'] == $this->md5($row['id'])) ? TRUE : FALSE; 

				unset( $data[$row['id']]['content_md5'] );
            
			}
		} else {
			$data = array();
		}
		
		return $data;

	}



	function get_one($id = NULL) {
		$row = $this->get_list($id);
		if(count($row) > 0) return $row[key($row)];	
	}



	function get_one_by_md5($screen_md5 = NULL) {
		$row = $this->get_list(NULL, $screen_md5);
		if(count($row) > 0) return $row[key($row)];	
	}



	function get_status($id) {
	
		$status = NULL;
		
		$this->db->select('TIMESTAMPDIFF(SECOND,screens.last_seen,NOW()) last_seen');
		$this->db->from('screens');
		$this->db->where('customer_id', $this->sess->customer_id);
		$this->db->where('screens.id', $id);
		$query = $this->db->get();
		
		$row = $query->row();
		
		if($query->num_rows() > 0) {
			if($row->last_seen > 300) $status = 'red';
			if($row->last_seen <= 300) $status = 'yellow';
			if($row->last_seen <= 60) $status = 'green';
			if($row->last_seen < 1) $status = NULL;
		}
		
		return $status;	
	}



	function delete($id) {
		$this->delete_fs($id);
		$this->db->where('id', $id);
		$this->db->delete('screens');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'schedule_id' => $this->input->post('schedule'),
			'dimension_id' => $this->input->post('dimension')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('screens', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $this->sess->customer_id;
			$data['screen_md5'] = md5(rand(1,999) . time());
			$this->db->insert('screens', $data);
			$id = $this->db->insert_id();
			return $id;
		}
		
	}



	function update_last_seen($id) {
		$this->db->set('last_seen', 'NOW()', FALSE);
		$this->db->where('id', $id);
		$this->db->update('screens');
	}



	function screen_media($screen_id) {
		$this->db->select('medias.id, medias.filename AS name');
		$this->db->from('medias');
		$this->db->join('v_relations', 'v_relations.media_id = medias.id');
		//$this->db->where('medias.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.screen_id', $screen_id);
		$this->db->order_by('medias.filename');
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



	function screen_bundles($screen_id) {
		$this->db->select('bundles.id, bundles.name');
		$this->db->from('bundles');
		$this->db->join('v_relations', 'v_relations.bundle_id = bundles.id');
		//$this->db->where('bundles.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.screen_id', $screen_id);
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



	function screen_layouts($screen_id) {
		$this->db->select('layouts.id, layouts.name');
		$this->db->from('layouts');
		$this->db->join('v_relations', 'v_relations.layout_id = layouts.id');
		//$this->db->where('layouts.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.screen_id', $screen_id);
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

	
	
	
	function screen_collections($screen_id) {
		$this->db->select('collections.id, collections.name');
		$this->db->from('collections');
		$this->db->join('v_relations', 'v_relations.collection_id = collections.id');
		//$this->db->where('collections.customer_id', $this->sess->customer_id);
		$this->db->where('v_relations.screen_id', $screen_id);
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



	function screen_players($screen_id) {
		$data = array();

		$this->db->select('player_md5, player_version, last_seen, ip, os, country');
		$this->db->from('v_players');
		$this->db->where('screen_id', $screen_id);
		$query = $this->db->get();
		
		$data = $query->result_array();

		return $data;
	}



	
	

	
	
	









	function delete_fs($screen_id) {
	   //TODO: right now orphan layout files are remaining,
	   // plan is to remove all related layout files and refresh them
	   // after collection is unlinked.
      @ unlink(DIR_FTP_SCREENS."/$screen_id/$screen_id.screen");
	}



	function update_fs($screen_id) {
      if($screen_id==0) return;
      
      $screen = $this->screen->get_one( $screen_id );
      $schedule_id = $screen['schedule_id'];
      $schedule = $this->schedule->get_one($schedule_id);

      $contents[] = implode(';', array_keys($schedule));
      $contents[] = implode(';', $schedule);

      if (!file_exists(DIR_FTP_SCREENS."/$screen_id")) {
         mkdir(DIR_FTP_SCREENS."/$screen_id");
      } else if (!is_dir(DIR_FTP_SCREENS."/$screen_id")) {
         unlink(DIR_FTP_SCREENS."/$screen_id");
         mkdir(DIR_FTP_SCREENS."/$screen_id");
      }

		$screen_file = DIR_FTP_SCREENS."/$screen_id/screen.rc";
		if (file_exists($screen_file)) {
         unlink($screen_file);
      }
	   file_put_contents($screen_file, implode("\n", $contents));


	}



	function md5($id) {

		$this->db->select('s.change_date AS s, cs.change_date AS cs, c.change_date AS c, lc.change_date AS lc, l.change_date AS l, bl.change_date AS bl, b.change_date AS b, mb.change_date AS mb, m.change_date AS m');
		$this->db->from('screens');
		$this->db->join('schedules AS s', 's.id = screens.schedule_id');
		$this->db->join('collections_schedules AS cs', 'cs.schedule_id = s.id');
		$this->db->join('collections AS c', 'c.id = cs.collection_id');
		$this->db->join('layouts_collections AS lc', 'lc.collection_id = c.id');
		$this->db->join('layouts AS l', 'l.id = lc.layout_id');
		$this->db->join('bundles_layouts AS bl', 'bl.layout_id = l.id');
		$this->db->join('bundles AS b', 'b.id = bl.bundle_id');
		$this->db->join('medias_bundles AS mb', 'mb.bundle_id = b.id');
		$this->db->join('medias AS m', 'm.id = mb.media_id');
		$this->db->where('screens.id', $id);
		$query = $this->db->get();
	
		$md5_string = '';
	
		foreach($query->result_array() as $row) {
			$md5_string .= implode(';', $row);
		}
		
		return md5($md5_string);
		
	}



	function _secondsToWords($secs) {
		$vals = array('w' => (int) ($secs / 604800), 
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
