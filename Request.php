<?php
/**
 * リクエストを管理する
 */
class Request
{
	var $params = array();

	function Request()
	{
		if (is_array($_REQUEST) === true) {
			$this->params = $_REQUEST;
		}
	}
	
	/**
	*HTMLから送信されてきたデータをクラス変数に格納する
	*
	*@access	public
	*@param		String		$name		連想配列のキーを指定
	*@param					$data		格納するデータ
	*@return							なし
	*/
	function add($name, $data)
	{
		$this->params[$name] = $data;
	}

	/**
	*リクエストのあったデータを返す
	*
	*@access	public
	*@param		String		$name		取得したい変数の名前
	*@return							リクエストのあった変数の値、無ければNULLを返す
	*/
	function get($name)
	{
		if (isset($this->params[$name]) === true) {
			return $this->params[$name];
		} else {
			return NULL;
		}
	}
	
	/**
	*送信されてきたデータを削除する
	*主に画面遷移等で変数を初期化したい場合に使用します。
	*検索画面←→登録画面の画面遷移で登録データの一部が勝手に検索条件に挿入されたり等のトラブルを
	*防ぎたい時に実行します。
	*
	*@access	public
	*@param		None
	*@return	None
	*/
	function deleteVariable()
	{
		$this->params = array();
	}
	
	/**
	*add関数で追加したデータと第2引数に指定したデータを比較し、同じであれば第2引数、違えば第3引数のデータを返す
	*関数の用途ですが、例えばチェックボックス等で指定したデータと送信されてきたデータが一致した場合に
	*checkedという文字を出力させたい時などに使用します。
	*
	*@access	public
	*@param		String		$name				add関数を用いてセットしたデータへ、アクセスするための連想配列のキー
	*@param		String		$comparison_data	第1引数の名前で取得したデータと比較するためのデータ
	*@param		MultiType	$case_of_true		第1引数で取得したデータと第2引数に指定したデータが同じ場合に返すデータ
	*@param		MultiType	$case_of_false		第1引数で取得したデータと第2引数に指定したデータが違う場合に返すデータ(デフォルトでNULLが返される)
	*@return	None
	*/
	function checkDataAndReturn($name, $comparison_data, $case_of_true, $case_of_false=null)
	{
		if ($this->get($name) == $comparison_data) {
			return $case_of_true;
		} else {
			return $case_of_false;
		}
	}
	
	/**
	*送信されてきたデータをすべて返す
	*
	*@access	public
	*@param		None
	*@return	Array		$this->params		送信されてきたデータの配列
	*/
	function getAllData()
	{
		return $this->params;
	}
	
	/**
	*指定されたデータを設定する
	*
	*@access	public
	*@param		Array		$params		設定する配列
	*@return	Boolean					true / false
	*/
	function setAllData($params)
	{
		if (is_array($params) === true) {
			$this->params = $params;
			return true;
		}
		
		return false;
	}
	
	/**
	*サニタイズ（HTML出力用）
	*HTMLにデータを出力する際に実行する。
	*
	*注意
	*多次元配列には対応していません。
	*
	*@access	public
	*@param		Boolean		$check_value	true / false
	*@return	Boolean						true / false
	*/
	function sanitizing($check_value=false)
	{
		if (is_array($this->params) == false) {
			false;
		}

		if ($check_value == true) {
			//いちいちチェックして変換
			foreach ($this->params AS $key=>$value) {
				if (is_resource($value) == true
						|| is_bool($value) == true
						|| is_object($value) == true) {
					continue;
				}
				if (is_array($value) == true) {
					$this->add($key, $this->listSanitizing($value));
					continue;
				}
				$this->add($key, htmlspecialchars($value, ENT_QUOTES));
			}
		} else {
			//デフォルト（データの値をチェックしない）
			$this->params = array_map('htmlspecialchars', $this->params);
		}
		return true;
	}
	
	/**
	*サニタイズ（HTML出力用）
	*
	*多次元配列変換用
	*
	*@access	public
	*@param		Array		$list		多次元配列
	*@return	Array		$list		値をサニタイズした多次元配列
	*/
	function listSanitizing($list)
	{
		foreach ($list as $key => $value) {
			if (is_resource($value) == true
					|| is_bool($value) == true
					|| is_object($value) == true) {
				continue;
			}
			if (is_array($value) == true) {
				$list[$key] = $this->listSanitizing($value);
				continue;
			}
			
			$list[$key] = htmlspecialchars($value, ENT_QUOTES);
		}
		
		return $list;
	}
	
	/**
	*addcslashes() でクォートされた文字列をアンクォートする
	*
	*ソフテルのシステムは未だにマジッククオートを利用している為、
	*一括でアンクォートしたいときに使用する。
	*
	*注意
	*多次元配列には対応していません。
	*
	*@access	public
	*@param		Boolean		$check_value	true / false
	*@return	Boolean						true / false
	*/
	function cancelMagicQuotes($check_value=false)
	{
		if (is_array($this->params) == false) {
			return false;
		}
		
		//アンクォート
		if ($check_value == true) {
			//いちいちチェックして変換
			foreach ($this->params AS $key=>$value) {
				if (is_resource($value) == true
						|| is_bool($value) == true
						|| is_object($value) == true) {
					continue;
				}
				if (is_array($value) == true) {
					$this->add($key, $this->listStripcslashes($value));
					continue;
				}
				$this->add($key, stripcslashes($value));
			}
		} else {
			//デフォルト（データの値をチェックしない）
			$this->params = array_map('stripcslashes', $this->params);
		}
		
		return true;
	}
	
	/**
	*アンクォートする
	*
	*多次元配列変換用
	*
	*@access	public
	*@param		Array		$list		多次元配列
	*@return	Array		$list		値をアンクォートした多次元配列
	*/
	function listStripcslashes($list)
	{
		foreach ($list as $key => $value) {
			if (is_resource($value) == true
					|| is_bool($value) == true
					|| is_object($value) == true) {
				continue;
			}
			if (is_array($value) == true) {
				$list[$key] = $this->listStripcslashes($value);
				continue;
			}
			
			$list[$key] = stripcslashes($value);
		}
		return $list;
	}
}
